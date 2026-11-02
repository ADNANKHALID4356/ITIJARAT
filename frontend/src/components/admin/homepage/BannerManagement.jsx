import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    IconButton,
    CircularProgress,
    Switch,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Tooltip,
    Alert
} from '@mui/material';
import {
    Plus,
    Eye,
    Edit3,
    Trash2,
    ArrowUp,
    ArrowDown,
    GripVertical,
    ExternalLink,
    Image as ImageIcon
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import API from '../../../api';
import { getImageUrl } from '../../../config';
import BannerSlideForm from './BannerSlideForm';
import BannerPreviewModal from './BannerPreviewModal';

const DND_TYPE = 'BANNER_SLIDE';

// Draggable Slide Row Component
const SlideRow = ({
    slide,
    index,
    totalSlides,
    moveSlide,
    commitReorder,
    onEdit,
    onDelete,
    onToggleActive
}) => {
    const [{ isDragging }, dragRef, previewRef] = useDrag({
        type: DND_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    const [, dropRef] = useDrop({
        accept: DND_TYPE,
        hover: (item) => {
            if (item.index === index) return;
            moveSlide(item.index, index);
            item.index = index;
        },
        drop: () => {
            commitReorder();
        }
    });

    const filename = slide.imageFilename || slide.image;
    const imageUrl = filename ? getImageUrl('banner-slides', filename) : '';

    return (
        <Paper
            ref={(node) => previewRef(dropRef(node))}
            elevation={isDragging ? 6 : 1}
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 2,
                opacity: isDragging ? 0.4 : 1,
                bgcolor: slide.isActive === false ? '#f8fafc' : '#ffffff',
                border: '1px solid',
                borderColor: slide.isActive === false ? '#e2e8f0' : '#cbd5e1',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                    borderColor: '#94a3b8',
                    boxShadow: 2
                }
            }}
        >
            {/* Drag Handle */}
            <Box
                ref={dragRef}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'grab',
                    color: '#94a3b8',
                    '&:hover': { color: '#475569' }
                }}
            >
                <GripVertical size={22} />
            </Box>

            {/* Order Badge & Up/Down Arrows */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                <IconButton
                    size="small"
                    disabled={index === 0}
                    onClick={() => {
                        moveSlide(index, index - 1);
                        commitReorder();
                    }}
                    sx={{ p: 0.2 }}
                    aria-label="Move slide up"
                >
                    <ArrowUp size={16} />
                </IconButton>
                <Chip
                    label={`#${index + 1}`}
                    size="small"
                    sx={{ fontSize: '0.75rem', fontWeight: 'bold', height: 20 }}
                />
                <IconButton
                    size="small"
                    disabled={index === totalSlides - 1}
                    onClick={() => {
                        moveSlide(index, index + 1);
                        commitReorder();
                    }}
                    sx={{ p: 0.2 }}
                    aria-label="Move slide down"
                >
                    <ArrowDown size={16} />
                </IconButton>
            </Box>

            {/* Thumbnail */}
            <Box
                sx={{
                    width: 120,
                    height: 68,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    bgcolor: '#0f172a',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0'
                }}
            >
                {imageUrl ? (
                    <Box
                        component="img"
                        src={imageUrl}
                        alt={slide.title || 'Slide thumbnail'}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <ImageIcon size={24} color="#64748b" />
                )}
            </Box>

            {/* Details */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {slide.title || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Untitled Slide</span>}
                    </Typography>
                    {slide.buttonText && (
                        <Chip
                            label={slide.buttonText}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                    )}
                </Box>

                {slide.subtitle && (
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                        {slide.subtitle}
                    </Typography>
                )}

                {slide.linkUrl && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ExternalLink size={12} color="#64748b" />
                        <Typography variant="caption" color="primary" noWrap sx={{ maxWidth: 300 }}>
                            {slide.linkUrl}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Status Active Switch */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pr: 1 }}>
                <Typography variant="caption" color={slide.isActive !== false ? 'success.main' : 'text.disabled'} fontWeight="bold">
                    {slide.isActive !== false ? 'Active' : 'Inactive'}
                </Typography>
                <Switch
                    checked={slide.isActive !== false}
                    onChange={() => onToggleActive(slide)}
                    size="small"
                    color="primary"
                />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit Slide">
                    <IconButton size="small" color="primary" onClick={() => onEdit(slide)}>
                        <Edit3 size={18} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete Slide">
                    <IconButton size="small" color="error" onClick={() => onDelete(slide)}>
                        <Trash2 size={18} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
};

const BannerManagement = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [slideToDelete, setSlideToDelete] = useState(null);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const response = await API.get('/banner', { params: { all: 'true' } });
            const data = Array.isArray(response.data) ? response.data : [];
            setSlides(data);
        } catch (error) {
            console.error('Error fetching banner slides:', error);
            toast.error(error.response?.data?.message || 'Failed to load banner slides.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const handleOpenAdd = () => {
        setEditingSlide(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (slide) => {
        setEditingSlide(slide);
        setFormOpen(true);
    };

    const handleSaveSlide = async (formData, slideId) => {
        try {
            setSaving(true);
            if (slideId) {
                // Update
                const response = await API.put(`/banner/slides/${slideId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Slide updated successfully');
                setSlides((prev) => prev.map((s) => (s._id === slideId ? response.data : s)));
            } else {
                // Create
                const response = await API.post('/banner/slides', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Slide created successfully');
                setSlides((prev) => [...prev, response.data]);
            }
            setFormOpen(false);
        } catch (error) {
            console.error('Error saving slide:', error);
            toast.error(error.response?.data?.message || 'Failed to save banner slide.');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDelete = (slide) => {
        setSlideToDelete(slide);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!slideToDelete) return;
        try {
            setSaving(true);
            await API.delete(`/banner/slides/${slideToDelete._id}`);
            toast.success('Slide deleted successfully');
            setSlides((prev) => prev.filter((s) => s._id !== slideToDelete._id));
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting slide:', error);
            toast.error(error.response?.data?.message || 'Failed to delete slide.');
        } finally {
            setSaving(false);
            setSlideToDelete(null);
        }
    };

    const handleToggleActive = async (slide) => {
        const newStatus = slide.isActive === false;
        // Optimistic UI update
        setSlides((prev) =>
            prev.map((s) => (s._id === slide._id ? { ...s, isActive: newStatus } : s))
        );

        try {
            await API.put(`/banner/slides/${slide._id}`, { isActive: newStatus });
            toast.info(`Slide marked as ${newStatus ? 'active' : 'inactive'}.`);
        } catch (error) {
            console.error('Error toggling active state:', error);
            toast.error('Failed to update slide status.');
            // Rollback
            setSlides((prev) =>
                prev.map((s) => (s._id === slide._id ? { ...s, isActive: !newStatus } : s))
            );
        }
    };

    const moveSlide = useCallback((dragIndex, hoverIndex) => {
        setSlides((prevSlides) => {
            const updated = [...prevSlides];
            const [draggedItem] = updated.splice(dragIndex, 1);
            updated.splice(hoverIndex, 0, draggedItem);
            return updated;
        });
    }, []);

    const commitReorder = async () => {
        try {
            const reorderedIds = slides.map((s) => s._id);
            await API.post('/banner/slides/reorder', { order: reorderedIds });
            toast.success('Slide order saved.');
        } catch (error) {
            console.error('Error saving order:', error);
            toast.error('Failed to save slide order.');
            fetchSlides(); // Revert
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        mb: 3,
                        gap: 2
                    }}
                >
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            Banner Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Add, edit, reorder, and activate homepage banner slides.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Eye size={18} />}
                            onClick={() => setPreviewOpen(true)}
                            disabled={slides.length === 0}
                        >
                            Preview
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Plus size={18} />}
                            onClick={handleOpenAdd}
                        >
                            Add Slide
                        </Button>
                    </Box>
                </Box>

                {/* Content */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <CircularProgress />
                    </Box>
                ) : slides.length === 0 ? (
                    <Paper
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            bgcolor: '#f8fafc',
                            border: '2px dashed #cbd5e1',
                            borderRadius: 3
                        }}
                    >
                        <ImageIcon size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            No Banner Slides Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
                            The homepage hero banner is currently empty. Click below to upload your first slide with an image and optional destination link.
                        </Typography>
                        <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleOpenAdd}>
                            Add First Slide
                        </Button>
                    </Paper>
                ) : (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                Drag rows by the handle (⋮⋮) or use up/down arrows to reorder.
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                {slides.filter((s) => s.isActive !== false).length} of {slides.length} active
                            </Typography>
                        </Box>

                        {slides.map((slide, index) => (
                            <SlideRow
                                key={slide._id || index}
                                slide={slide}
                                index={index}
                                totalSlides={slides.length}
                                moveSlide={moveSlide}
                                commitReorder={commitReorder}
                                onEdit={handleOpenEdit}
                                onDelete={handleOpenDelete}
                                onToggleActive={handleToggleActive}
                            />
                        ))}
                    </Box>
                )}

                {/* Add/Edit Slide Form Modal */}
                <BannerSlideForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSave={handleSaveSlide}
                    slide={editingSlide}
                    saving={saving}
                />

                {/* Live Preview Modal */}
                <BannerPreviewModal
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    slides={slides}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle fontWeight="bold">Delete Banner Slide?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this slide? Its uploaded image file will be permanently deleted from the server.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} disabled={saving} color="error" variant="contained">
                            {saving ? 'Deleting...' : 'Delete Slide'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DndProvider>
    );
};

export default BannerManagement;
