import React, { useState, useEffect } from 'react';
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
import { X, ChevronLeft, ChevronRight, Pause, Play, ExternalLink } from 'lucide-react';
import { getImageUrl } from '../../../config';

const BannerPreviewModal = ({ open, onClose, slides = [] }) => {
    const activeSlides = slides.filter(s => s.isActive !== false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (open) {
            setCurrentIndex(0);
            setIsPaused(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open || activeSlides.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [open, activeSlides.length, isPaused]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    };

    const currentSlide = activeSlides[currentIndex];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Banner Live Preview
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

            <DialogContent dividers sx={{ p: { xs: 1, sm: 3 } }}>
                {activeSlides.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No active slides to preview
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Activate at least one slide or add a new slide with an image to preview it here.
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        sx={{
                            position: 'relative',
                            width: '100%',
                            height: { xs: 240, sm: 360, md: 440 },
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: '#0f172a',
                            boxShadow: 3
                        }}
                    >
                        {/* Slide image */}
                        {currentSlide && (
                            <Box
                                component="img"
                                src={getImageUrl('banner-slides', currentSlide.imageFilename || currentSlide.image)}
                                alt={currentSlide.title || 'Slide'}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                                onError={(e) => {
                                    e.target.src = '/placeholder-banner.jpg';
                                }}
                            />
                        )}

                        {/* Title & Subtitle overlay box */}
                        {currentSlide && (currentSlide.title || currentSlide.subtitle) && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: { xs: 16, sm: 28 },
                                    left: { xs: 16, sm: 28 },
                                    maxWidth: { xs: '80%', sm: 420 },
                                    bgcolor: 'rgba(0, 0, 0, 0.45)',
                                    backdropFilter: 'blur(8px)',
                                    p: { xs: 1.5, sm: 2 },
                                    borderRadius: 1.5,
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#fff',
                                    zIndex: 10
                                }}
                            >
                                {currentSlide.title && (
                                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                        {currentSlide.title}
                                    </Typography>
                                )}
                                {currentSlide.subtitle && (
                                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                        {currentSlide.subtitle}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Action CTA Button */}
                        {currentSlide && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: { xs: 16, sm: 28 },
                                    left: { xs: 16, sm: 28 },
                                    zIndex: 10
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="medium"
                                    endIcon={currentSlide.linkUrl ? <ExternalLink size={14} /> : null}
                                    sx={{
                                        borderRadius: 8,
                                        bgcolor: '#fff',
                                        color: '#000',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        px: 3,
                                        py: 1,
                                        '&:hover': { bgcolor: '#f1f5f9' }
                                    }}
                                >
                                    {currentSlide.buttonText || 'Shop now'}
                                </Button>
                            </Box>
                        )}

                        {/* Controls (arrows) */}
                        {activeSlides.length > 1 && (
                            <>
                                <IconButton
                                    onClick={handlePrev}
                                    aria-label="Previous slide"
                                    sx={{
                                        position: 'absolute',
                                        left: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(0,0,0,0.3)',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                                        zIndex: 20
                                    }}
                                >
                                    <ChevronLeft size={24} />
                                </IconButton>
                                <IconButton
                                    onClick={handleNext}
                                    aria-label="Next slide"
                                    sx={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(0,0,0,0.3)',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                                        zIndex: 20
                                    }}
                                >
                                    <ChevronRight size={24} />
                                </IconButton>
                            </>
                        )}

                        {/* Dot indicators */}
                        {activeSlides.length > 1 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 12,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: 1,
                                    zIndex: 20
                                }}
                            >
                                {activeSlides.map((_, i) => (
                                    <Box
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        sx={{
                                            width: i === currentIndex ? 24 : 8,
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {activeSlides.length > 1 && (
                        <Button
                            size="small"
                            startIcon={isPaused ? <Play size={14} /> : <Pause size={14} />}
                            onClick={() => setIsPaused(!isPaused)}
                            color="inherit"
                        >
                            {isPaused ? 'Resume Auto-scroll' : 'Pause Auto-scroll'}
                        </Button>
                    )}
                </Box>
                <Button onClick={onClose} variant="contained">
                    Close Preview
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BannerPreviewModal;
