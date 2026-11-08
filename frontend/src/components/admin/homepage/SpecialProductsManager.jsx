import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { Eye, ArrowLeft, ArrowUp, ArrowDown, Star } from 'lucide-react';

import CategorySelector from './CategorySelector';
import ProductSelectionModal from './ProductSelectionModal';
import FeaturedBentoGrid from '../../FeaturedBentoGrid';
import { toast } from 'react-toastify';
import axios from 'axios';
import { config, getApiUrl, getImageUrl } from '../../../config';

const getProductImage = (product) => {
    if (!product) return null;
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.image || product.images[0];
    }
    if (product.image) {
        return product.image;
    }
    return null;
};

const SpecialProductsManager = ({ type }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 20;

    const endpoint = type === 'featured' ? 'special/featured' : 'special/premium';
    const title = type === 'featured' ? 'Featured Products' : 'Premium Products';

    // Cache for optimizing requests
    const cache = useRef({
        selectedProducts: { data: null, timestamp: 0 },
        categoryProducts: { data: null, timestamp: 0, category: null, page: null }
    });

    // Load initial data
    useEffect(() => {
        loadSelectedProducts();
    }, []);

    // Load category products when category or page changes
    useEffect(() => {
        if (selectedCategory) {
            loadCategoryProducts();
        }
    }, [selectedCategory, page]);

    const loadSelectedProducts = async () => {
        const now = Date.now();
        if (cache.current.selectedProducts.data && 
            now - cache.current.selectedProducts.timestamp < 30000) {
            setSelectedProducts(cache.current.selectedProducts.data);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(getApiUrl(endpoint), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = response.data || [];
            
            cache.current.selectedProducts = {
                timestamp: now,
                data: data
            };
            
            setSelectedProducts(data);
        } catch (error) {
            const message = error.response?.data?.message || 'Error loading selected products';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const loadCategoryProducts = async () => {
        if (!selectedCategory) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(getApiUrl('products'), {
                params: {
                    category: selectedCategory.name,
                    isActive: true,
                    page,
                    limit: PAGE_SIZE,
                    populate: ['category']
                }
            });
            
            const availableProducts = (response.data.products || []).filter(product => 
                !selectedProducts.some(sp => sp._id === product._id)
            );

            setCategoryProducts(availableProducts);
            setTotalPages(Math.ceil(response.data.totalProducts / PAGE_SIZE));
        } catch (error) {
            const message = error.response?.data?.message || 'Error loading category products';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const persistProducts = async (updatedProducts, successMessage) => {
        setSelectedProducts(updatedProducts);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                productIds: updatedProducts.map(p => p._id)
            };

            if (type === 'featured') {
                payload.layoutConfig = updatedProducts.map((p, idx) => ({
                    productId: p._id,
                    slotSize: p.slotSize || (idx === 0 ? 'hero' : 'small'),
                    order: idx
                }));
            }

            await axios.put(
                getApiUrl(endpoint),
                payload,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            cache.current.selectedProducts = {
                data: updatedProducts,
                timestamp: Date.now()
            };

            if (successMessage) {
                toast.success(successMessage);
            }
        } catch (error) {
            console.error('Error updating special products:', error);
            toast.error(error.response?.data?.message || 'Error saving changes');
            loadSelectedProducts();
        }
    };

    const handleCategoryChange = async (category) => {
        if (!category) {
            setSelectedCategory(null);
            setCategoryProducts([]);
            return;
        }
        setPage(1);
        setSelectedCategory(category);
    };

    const handleAddProduct = async (product) => {
        const enrichedProduct = {
            ...product,
            slotSize: selectedProducts.length === 0 ? 'hero' : 'small'
        };
        const updatedProducts = [...selectedProducts, enrichedProduct];
        setCategoryProducts(prev => prev.filter(p => p._id !== product._id));
        await persistProducts(updatedProducts, `Product added to ${title}`);
    };

    const handleRemoveProduct = async (productId) => {
        const removedProduct = selectedProducts.find(p => p._id === productId);
        const updatedProducts = selectedProducts.filter(p => p._id !== productId);
        
        if (selectedCategory && removedProduct) {
            setCategoryProducts(prev => [...prev, removedProduct]);
        }
        await persistProducts(updatedProducts, 'Product removed successfully');
    };

    const handleMoveProduct = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= selectedProducts.length) return;

        const newProducts = [...selectedProducts];
        const [moved] = newProducts.splice(index, 1);
        newProducts.splice(targetIndex, 0, moved);

        await persistProducts(newProducts, 'Layout order updated');
    };

    const handleSetSlotSize = async (productId, newSlotSize) => {
        const updatedProducts = selectedProducts.map(p => {
            if (p._id === productId) {
                return { ...p, slotSize: newSlotSize };
            }
            // If promoting this item to hero, demote any other hero to small
            if (newSlotSize === 'hero' && p.slotSize === 'hero') {
                return { ...p, slotSize: 'small' };
            }
            return p;
        });

        await persistProducts(updatedProducts, 'Tile size updated');
    };

    if (loading && selectedProducts.length === 0) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, color: 'error.main' }}>
                <Typography>{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div>
                    <Typography variant="h5" fontWeight="bold">
                        Manage {title}
                    </Typography>
                    {type === 'featured' && (
                        <Typography variant="body2" color="text.secondary">
                            Configure products, arrange layout order, and allocate Bento tile sizes (Hero, Wide, Tall, Small).
                        </Typography>
                    )}
                </div>

                {type === 'featured' && selectedProducts.length > 0 && (
                    <Button
                        variant={isPreviewMode ? "contained" : "outlined"}
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        startIcon={<Eye />}
                    >
                        {isPreviewMode ? 'Exit Preview' : 'Preview Bento Grid'}
                    </Button>
                )}
            </Box>

            {/* Live Bento Preview Mode */}
            {isPreviewMode && type === 'featured' ? (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 3, 
                        mb: 4, 
                        bgcolor: 'grey.50', 
                        borderRadius: 3, 
                        border: '1px solid', 
                        borderColor: 'grey.200' 
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <div>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Live Bento Grid Preview
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Exact image-only display as seen by homepage visitors ({selectedProducts.length} items)
                            </Typography>
                        </div>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => setIsPreviewMode(false)}
                        >
                            Back to Management
                        </Button>
                    </Box>
                    <Box sx={{ bgcolor: 'white', p: { xs: 1, sm: 2, md: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                        <FeaturedBentoGrid 
                            products={selectedProducts} 
                            title="Featured Products"
                            subtitle="Live layout preview"
                        />
                    </Box>
                </Paper>
            ) : null}

            {/* Selected Products List */}
            {!isPreviewMode && (
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Selected Products ({selectedProducts.length})
                        </Typography>
                    </Box>

                    {selectedProducts.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300' }}>
                            <Typography color="text.secondary">
                                No products selected for {title}. Select a category below to add products.
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={2}>
                            {selectedProducts.map((product, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        {/* Card Header with position & tactile order buttons */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.100' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip 
                                                    label={`#${index + 1}`} 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold', height: 22 }} 
                                                />
                                                {type === 'featured' && (
                                                    <Chip 
                                                        label={product.slotSize === 'hero' || (index === 0 && !product.slotSize) ? '⭐ Hero' : (product.slotSize || 'Small').toUpperCase()} 
                                                        color={product.slotSize === 'hero' || (index === 0 && !product.slotSize) ? 'primary' : 'default'}
                                                        size="small"
                                                        sx={{ height: 22, textTransform: 'capitalize' }}
                                                    />
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleMoveProduct(index, -1)}
                                                    disabled={index === 0}
                                                    title="Move earlier"
                                                >
                                                    <ArrowUp size={16} />
                                                </IconButton>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleMoveProduct(index, 1)}
                                                    disabled={index === selectedProducts.length - 1}
                                                    title="Move later"
                                                >
                                                    <ArrowDown size={16} />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <CardMedia
                                            component="img"
                                            sx={{
                                                height: 160,
                                                objectFit: 'cover',
                                                bgcolor: 'grey.200'
                                            }}
                                            image={getImageUrl('products', getProductImage(product)) || '/placeholder-image.png'}
                                            alt={product.title || product.name || 'Product'}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />

                                        <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                                            <Typography variant="body2" fontWeight="bold" noWrap title={product.title || product.name}>
                                                {product.title || product.name || 'Untitled Product'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                PKR {product.price || '0.00'}
                                            </Typography>

                                            {type === 'featured' && (
                                                <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                                                    <InputLabel id={`slot-size-label-${product._id}`}>Tile Size</InputLabel>
                                                    <Select
                                                        labelId={`slot-size-label-${product._id}`}
                                                        value={product.slotSize || (index === 0 ? 'hero' : 'small')}
                                                        label="Tile Size"
                                                        onChange={(e) => handleSetSlotSize(product._id, e.target.value)}
                                                    >
                                                        <MenuItem value="hero">Hero (2x2 Dominant)</MenuItem>
                                                        <MenuItem value="wide">Wide (2x1 Horizontal)</MenuItem>
                                                        <MenuItem value="tall">Tall (1x2 Vertical)</MenuItem>
                                                        <MenuItem value="small">Small (1x1 Standard)</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}
                                        </CardContent>

                                        <CardActions sx={{ p: 1, pt: 0 }}>
                                            <Button 
                                                fullWidth 
                                                variant="outlined" 
                                                color="error" 
                                                size="small"
                                                onClick={() => handleRemoveProduct(product._id)}
                                            >
                                                Remove
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}

            {/* Category Product Selection Section */}
            {!isPreviewMode && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Add Products from Category
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <CategorySelector 
                            onCategoryChange={handleCategoryChange} 
                            returnFullObject={true}
                        />
                    </Box>

                    {selectedCategory && (
                        <Box sx={{ position: 'relative' }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Available in {selectedCategory.name}
                            </Typography>
                            
                            {loading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {!loading && categoryProducts.length === 0 ? (
                                <Typography color="text.secondary">
                                    No available products found in this category.
                                </Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {categoryProducts.map((product) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                <CardMedia
                                                    component="img"
                                                    sx={{
                                                        height: 140,
                                                        objectFit: 'cover',
                                                        background: '#f5f5f5'
                                                    }}
                                                    image={getImageUrl('products', getProductImage(product)) || '/placeholder-image.png'}
                                                    alt={product.title || product.name || 'Product'}
                                                    loading="lazy"
                                                />
                                                <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                                                    <Typography variant="body2" fontWeight="bold" noWrap>
                                                        {product.title || product.name || 'Untitled Product'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        PKR {product.price || '0.00'}
                                                    </Typography>
                                                </CardContent>
                                                <Box sx={{ p: 1 }}>
                                                    <Button 
                                                        fullWidth 
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleAddProduct(product)}
                                                    >
                                                        Add to {title}
                                                    </Button>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}

                            {totalPages > 1 && (
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={(e, value) => setPage(value)}
                                        color="primary"
                                        disabled={loading}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default SpecialProductsManager;
