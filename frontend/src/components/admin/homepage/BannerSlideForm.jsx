import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Typography,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../../../config';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

const BannerSlideForm = ({ open, onClose, onSave, slide = null, saving = false }) => {
    const isEdit = Boolean(slide && slide._id);

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [buttonText, setButtonText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            if (slide) {
                setTitle(slide.title || '');
                setSubtitle(slide.subtitle || '');
                setButtonText(slide.buttonText || '');
                setLinkUrl(slide.linkUrl || '');
                setIsActive(slide.isActive !== false);
                setSelectedFile(null);
                const existingImage = slide.imageFilename || slide.image;
                setPreviewUrl(existingImage ? getImageUrl('banner-slides', existingImage) : '');
            } else {
                setTitle('');
                setSubtitle('');
                setButtonText('');
                setLinkUrl('');
                setIsActive(true);
                setSelectedFile(null);
                setPreviewUrl('');
            }
            setError('');
        }
    }, [open, slide]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
            setError('Only image files (JPEG, PNG, WebP, AVIF, GIF) are allowed.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('File size exceeds 5 MB. Please choose a smaller image.');
            return;
        }

        setError('');
        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Required check: either a newly selected file or an existing slide with image
        if (!selectedFile && !isEdit && !previewUrl) {
            setError('Please upload a banner slide image.');
            return;
        }

        if (isEdit && !selectedFile && !slide.imageFilename && !slide.image) {
            setError('Please upload a banner slide image.');
            return;
        }

        const formData = new FormData();
        if (selectedFile) {
            formData.append('image', selectedFile);
        }
        formData.append('title', title.trim());
        formData.append('subtitle', subtitle.trim());
        formData.append('buttonText', buttonText.trim());
        formData.append('linkUrl', linkUrl.trim());
        formData.append('isActive', String(isActive));

        onSave(formData, slide?._id);
    };

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="span" fontWeight="bold">
                    {isEdit ? 'Edit Banner Slide' : 'Add New Banner Slide'}
                </Typography>
                {!saving && (
                    <IconButton aria-label="close" onClick={onClose} size="small">
                        <X size={20} />
                    </IconButton>
                )}
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Image Upload Area */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Banner Image {!isEdit && <span style={{ color: '#d32f2f' }}>*</span>}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                            Recommended aspect ratio: 16:5 / Widescreen (~1920×600 px). Max file size: 5 MB. Formats: JPEG, PNG, WebP, AVIF.
                        </Typography>

                        {previewUrl ? (
                            <Box sx={{ position: 'relative', mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0', bgcolor: '#111' }}>
                                <Box
                                    component="img"
                                    src={previewUrl}
                                    alt="Slide preview"
                                    sx={{
                                        width: '100%',
                                        maxHeight: 280,
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                                <Box sx={{ p: 1.5, bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedFile ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Current Slide Image'}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        component="label"
                                        startIcon={<Upload size={16} />}
                                    >
                                        Change Image
                                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                component="label"
                                sx={{
                                    border: '2px dashed #b0bec5',
                                    borderRadius: 2,
                                    p: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    bgcolor: '#fafafa',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: '#1976d2',
                                        bgcolor: '#f0f7ff'
                                    }
                                }}
                            >
                                <ImageIcon size={48} color="#78909c" style={{ marginBottom: 12 }} />
                                <Typography variant="subtitle1" fontWeight="600" color="primary">
                                    Click or drag image to upload
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    PNG, JPG, WebP, AVIF up to 5 MB
                                </Typography>
                                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                            </Box>
                        )}
                    </Box>

                    {/* Title */}
                    <TextField
                        fullWidth
                        label="Slide Title (Optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Summer Mega Sale"
                        sx={{ mb: 2 }}
                        disabled={saving}
                    />

                    {/* Subtitle */}
                    <TextField
                        fullWidth
                        label="Slide Subtitle (Optional)"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="e.g. Up to 50% off on all trending categories"
                        sx={{ mb: 2 }}
                        disabled={saving}
                    />

                    {/* Button Text */}
                    <TextField
                        fullWidth
                        label="Button Text (Optional)"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="e.g. Shop Now, Explore Categories, View Deals"
                        helperText="Text shown on the slide's action button. Leave blank for default 'Shop now'."
                        sx={{ mb: 2 }}
                        disabled={saving}
                    />

                    {/* Link URL */}
                    <TextField
                        fullWidth
                        label="Destination Link URL (Optional)"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="e.g. /products?category=electronics or https://example.com/promo"
                        helperText="Internal paths start with / (e.g. /products). External URLs start with http:// or https://"
                        sx={{ mb: 2 }}
                        disabled={saving}
                    />

                    {/* Active Toggle */}
                    <Box sx={{ mt: 1 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    color="primary"
                                    disabled={saving}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                        Active on Homepage
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        When active, this slide appears in the homepage hero carousel.
                                    </Typography>
                                </Box>
                            }
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} disabled={saving} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={saving}
                        startIcon={saving && <CircularProgress size={16} color="inherit" />}
                    >
                        {saving ? 'Saving...' : isEdit ? 'Update Slide' : 'Add Slide'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default BannerSlideForm;

