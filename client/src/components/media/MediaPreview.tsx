import React, { useRef, useState, useEffect } from 'react';
import { Button, LoadingSpinner } from '../ui';

// Image Preview Component
interface ImagePreviewProps {
    src: string;
    alt?: string;
    onDownload?: () => void;
    className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    src,
    alt = 'Generated image',
    onDownload,
    className = '',
}) => {
    const [loaded, setLoaded] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    return (
        <>
            <div className={`relative group ${className}`}>
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
                        <LoadingSpinner size="md" />
                    </div>
                )}
                <img
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    className={`rounded-2xl max-w-full cursor-pointer transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setFullscreen(true)}
                />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                        onClick={() => setFullscreen(true)}
                        className="w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center text-white hover:bg-black/70"
                    >
                        <i className="fa-solid fa-expand text-xs" />
                    </button>
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center text-white hover:bg-black/70"
                        >
                            <i className="fa-solid fa-download text-xs" />
                        </button>
                    )}
                </div>
            </div>

            {fullscreen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
                    onClick={() => setFullscreen(false)}
                >
                    <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />
                    <button
                        onClick={() => setFullscreen(false)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
                    >
                        <i className="fa-solid fa-times text-lg" />
                    </button>
                </div>
            )}
        </>
    );
};

// Video Player Component
interface VideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    className = '',
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (videoRef.current) {
            if (playing) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setPlaying(!playing);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`relative rounded-2xl overflow-hidden bg-black ${className}`}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setPlaying(false)}
                className="w-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
                    >
                        <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} />
                    </button>
                    <div className="flex-1">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-white text-xs font-mono">
                        {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Audio Player Component
interface AudioPlayerProps {
    src: string;
    title?: string;
    className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    src,
    title = 'Audio',
    className = '',
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [waveform, setWaveform] = useState<number[]>([]);

    useEffect(() => {
        // Generate fake waveform for visualization
        const bars = 50;
        const wave = Array.from({ length: bars }, () => Math.random() * 0.5 + 0.3);
        setWaveform(wave);
    }, [src]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (playing) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setPlaying(!playing);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 ${className}`}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setPlaying(false)}
            />

            <div className="flex items-center gap-4">
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 shrink-0"
                >
                    <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} />
                </button>

                <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{title}</p>

                    {/* Waveform visualization */}
                    <div className="flex items-end gap-0.5 h-8 mb-2">
                        {waveform.map((height, i) => {
                            const isPlayed = (i / waveform.length) * 100 < progress;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all ${isPlayed ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    style={{ height: `${height * 100}%` }}
                                />
                            );
                        })}
                    </div>

                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{formatTime((progress / 100) * duration)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Gallery Grid Component
interface MediaItem {
    id: string;
    type: 'image' | 'video' | 'audio';
    path: string;
    metadata: any;
    createdAt: string;
}

interface GalleryGridProps {
    items: MediaItem[];
    onSelect?: (item: MediaItem) => void;
    onDelete?: (id: string) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
    items,
    onSelect,
    onDelete,
}) => {
    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <i className="fa-solid fa-images text-4xl mb-4 opacity-30" />
                <p className="text-sm">No media yet. Generate some!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                    onClick={() => onSelect?.(item)}
                >
                    {item.type === 'image' && (
                        <img
                            src={item.path}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    )}
                    {item.type === 'video' && (
                        <div className="w-full h-full flex items-center justify-center">
                            <i className="fa-solid fa-film text-3xl text-slate-400" />
                        </div>
                    )}
                    {item.type === 'audio' && (
                        <div className="w-full h-full flex items-center justify-center">
                            <i className="fa-solid fa-music text-3xl text-slate-400" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30">
                            <i className="fa-solid fa-eye text-xs" />
                        </button>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="w-8 h-8 bg-red-500/80 rounded-lg flex items-center justify-center text-white hover:bg-red-600"
                            >
                                <i className="fa-solid fa-trash text-xs" />
                            </button>
                        )}
                    </div>

                    <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-black/50 rounded-lg text-[9px] font-bold text-white uppercase">
                            {item.type}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
