import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    Chip
} from '@mui/material';
import { X } from 'lucide-react';
import HeroSection from '../../HeroSection';

const BannerPreviewModal = ({ open, onClose, slides = [] }) => {
    const activeSlides = slides.filter((s) => s.isActive !== false);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Banner Live Homepage Preview
                    </Typography>
                    <Chip
                        label={`${activeSlides.length} Active Slide${activeSlides.length === 1 ? '' : 's'}`}
                        size="small"
                        color={activeSlides.length > 0 ? 'success' : 'default'}
                    />
                </Box>
                <IconButton onClick={onClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0, bgcolor: '#f8fafc' }}>
                {activeSlides.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No active slides to preview
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Activate at least one slide or create a new slide with an image to preview it here.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ width: '100%', overflow: 'hidden' }}>
                        <HeroSection banners={activeSlides} hideCards={true} />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 1.5 }}>
                <Button onClick={onClose} variant="contained">
                    Close Preview
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BannerPreviewModal;
