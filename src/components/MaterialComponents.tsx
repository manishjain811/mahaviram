/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ChevronDown, AlertTriangle, CheckCircle, 
  Camera, Image as ImageIcon, X, Trash2, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVATAR_PRESETS } from '../data/seedData';

// --- M3BUTTON ---
interface M3ButtonProps {
  id?: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'text' | 'tonal';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function M3Button({
  id,
  onClick,
  children,
  variant = 'filled',
  disabled = false,
  className = '',
  icon
}: M3ButtonProps) {
  let baseStyles = 'px-6 py-3 rounded-full font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 relative overflow-hidden active:scale-98 select-none';
  let variantStyles = '';

  switch (variant) {
    case 'filled':
      variantStyles = 'bg-primary text-white hover:bg-primary-dark shadow-md active:shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none';
      break;
    case 'tonal':
      variantStyles = 'bg-primary-light text-primary-dark hover:brightness-95 active:brightness-90 disabled:bg-slate-100 disabled:text-slate-400';
      break;
    case 'outlined':
      variantStyles = 'bg-transparent border border-slate-300 text-primary hover:bg-primary/5 active:bg-primary/10 disabled:border-slate-200 disabled:text-slate-400';
      break;
    case 'text':
      variantStyles = 'bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10 disabled:text-slate-400 py-2.5 px-4';
      break;
  }

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

// --- M3TEXTFIELD ---
interface M3TextFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  disabled?: boolean;
}

export function M3TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error,
  required = false,
  icon,
  trailingIcon,
  disabled = false
}: M3TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full flex flex-col gap-1 select-none">
      <div className="relative w-full">
        {/* Leading Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 flex items-center justify-center">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full font-sans text-sm rounded-2xl bg-white border px-4 py-3.5 outline-none transition-all ${
            icon ? 'pl-11' : ''
          } ${
            trailingIcon ? 'pr-11' : ''
          } ${
            error 
              ? 'border-rose-500 ring-1 ring-rose-500' 
              : isFocused 
                ? 'border-primary ring-1 ring-primary' 
                : 'border-slate-300 hover:border-slate-400'
          } text-slate-800 placeholder-slate-400`}
        />

        {/* Dynamic Float Label style, but inside the border for stable custom layout */}
        <div 
          className={`absolute left-3 transition-all pointer-events-none px-1 rounded bg-white ${
            value || isFocused 
              ? '-top-2 text-xs font-semibold ' + (error ? 'text-rose-500' : isFocused ? 'text-primary' : 'text-slate-500')
              : 'top-1/2 -translate-y-1/2 text-sm text-slate-400 ' + (icon ? 'left-11' : 'left-4')
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </div>

        {/* Trailing Icon */}
        {trailingIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 flex items-center justify-center">
            {trailingIcon}
          </div>
        )}
      </div>

      {/* Helper text or validation error */}
      {error && (
        <span className="text-xs text-rose-500 font-medium px-2 flex items-center gap-1 animate-fadeIn">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
    </div>
  );
}

// --- M3CARD ---
interface M3CardProps {
  key?: any;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function M3Card({
  children,
  onClick,
  className = '',
  variant = 'elevated'
}: M3CardProps) {
  let cardStyles = 'rounded-2xl p-4 transition-all bg-white select-none ';

  if (onClick) {
    cardStyles += 'cursor-pointer hover:scale-[1.01] active:scale-99 ';
  }

  switch (variant) {
    case 'elevated':
      cardStyles += 'm3-shadow-1 hover:m3-shadow-2';
      break;
    case 'outlined':
      cardStyles += 'border border-slate-200';
      break;
    case 'flat':
      cardStyles += 'bg-slate-100/80';
      break;
  }

  return (
    <div onClick={onClick} className={`${cardStyles} ${className}`}>
      {children}
    </div>
  );
}

// --- M3SELECT / DROPDOWN (Native Android Bottom-Sheet Style) ---
interface M3DropdownProps {
  id?: string;
  label: string;
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  icon?: React.ReactNode;
}

export function M3Dropdown({
  id,
  label,
  options,
  selected,
  onSelect,
  icon
}: M3DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full flex flex-col gap-1 select-none">
      <div 
        id={id}
        onClick={() => setIsOpen(true)}
        className="relative w-full cursor-pointer bg-white border border-slate-300 hover:border-slate-400 rounded-2xl px-4 py-3.5 flex items-center justify-between text-sm text-slate-800 transition-all select-none"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-slate-400 w-5 h-5 flex items-center justify-center">{icon}</span>}
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="font-semibold text-slate-800 mt-0.5">{selected || 'Select option'}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </div>

      {/* Material 3 Bottom Sheet Modal representation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black z-100 rounded-[30px]"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 max-h-[75%] bg-white rounded-t-[28px] z-110 shadow-2xl pb-8 flex flex-col border-t border-slate-100"
            >
              {/* Grab bar */}
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-3.5" />
              
              <div className="px-6 pb-4 border-b border-slate-100">
                <h3 className="font-display font-bold text-base text-slate-900">{label}</h3>
              </div>

              <div className="overflow-y-auto max-h-[300px] py-2">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-6 py-4 text-sm font-medium transition-all flex items-center justify-between ${
                      selected === option 
                        ? 'bg-primary-light text-primary-dark font-semibold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{option}</span>
                    {selected === option && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- M3 CIRCULAR LOADER ---
export function M3CircularProgress({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-14 h-14 border-4'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div 
        className={`animate-spin rounded-full border-t-primary border-r-transparent border-b-primary border-l-transparent ${sizeClasses[size]}`}
      />
    </div>
  );
}

// --- PROFILE PHOTO CAM-GALLERY SIMULATOR ---
interface CameraGallerySimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photoUrl: string) => void;
}

export function CameraGallerySimulator({
  isOpen,
  onClose,
  onSelectPhoto
}: CameraGallerySimulatorProps) {
  const [activeTab, setActiveTab] = useState<'options' | 'camera' | 'gallery'>('options');
  const [cameraState, setCameraState] = useState<'idle' | 'countdown' | 'flash' | 'captured'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleTakePhoto = () => {
    setCameraState('countdown');
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCameraState('flash');
          setTimeout(() => {
            // Trigger Flash and choose a randomized premium portrait
            const portraits = [
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150',
              'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150&h=150',
              'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=150&h=150'
            ];
            const randomPic = portraits[Math.floor(Math.random() * portraits.length)];
            setCapturedImage(randomPic);
            setCameraState('captured');
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCamera = () => {
    setCameraState('idle');
    setCapturedImage(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay backdrop inside device frame */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 z-100 rounded-[30px]"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="absolute inset-x-5 top-1/2 -translate-y-1/2 bg-white rounded-3xl z-110 shadow-2xl p-6 flex flex-col gap-4 text-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                {activeTab === 'options' && 'Select Profile Photo'}
                {activeTab === 'camera' && 'Selfie Camera View'}
                {activeTab === 'gallery' && 'Select Avatar'}
              </h3>
              <button 
                onClick={() => {
                  setActiveTab('options');
                  resetCamera();
                  onClose();
                }}
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content Switcher */}
            {activeTab === 'options' && (
              <div className="grid grid-cols-2 gap-4 py-3">
                <button
                  onClick={() => setActiveTab('camera')}
                  className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="p-3 bg-primary-light text-primary-dark rounded-full group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Take Selfie</span>
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-secondary hover:bg-secondary/5 transition-all group"
                >
                  <div className="p-3 bg-secondary/10 text-secondary-dark rounded-full group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Choose Avatar</span>
                </button>
              </div>
            )}

            {/* Camera View Mode */}
            {activeTab === 'camera' && (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-full aspect-square max-w-[200px] bg-slate-900 rounded-2xl overflow-hidden relative border-2 border-slate-700 flex items-center justify-center text-white font-mono shadow-inner">
                  {cameraState === 'idle' && (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <Camera className="w-10 h-10 text-slate-400 animate-pulse" />
                      <span className="text-xs text-slate-400">Position your face in the box</span>
                    </div>
                  )}

                  {cameraState === 'countdown' && (
                    <motion.span 
                      key={countdown}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      className="text-4xl font-black text-accent"
                    >
                      {countdown}
                    </motion.span>
                  )}

                  {cameraState === 'flash' && (
                    <div className="absolute inset-0 bg-white animate-flash" />
                  )}

                  {cameraState === 'captured' && capturedImage && (
                    <img 
                      src={capturedImage} 
                      alt="Selfie Snapshot" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full">
                  {cameraState === 'captured' ? (
                    <>
                      <M3Button 
                        variant="outlined" 
                        onClick={resetCamera} 
                        className="flex-1 py-2.5"
                      >
                        Retake
                      </M3Button>
                      <M3Button 
                        variant="filled" 
                        onClick={() => {
                          if (capturedImage) onSelectPhoto(capturedImage);
                          setActiveTab('options');
                          resetCamera();
                          onClose();
                        }} 
                        className="flex-1 py-2.5"
                      >
                        Use Photo
                      </M3Button>
                    </>
                  ) : (
                    <M3Button 
                      variant="filled" 
                      onClick={handleTakePhoto} 
                      disabled={cameraState === 'countdown'}
                      className="w-full py-2.5"
                      icon={<Camera className="w-4 h-4" />}
                    >
                      Capture Snapshot
                    </M3Button>
                  )}
                </div>
              </div>
            )}

            {/* Gallery View Mode */}
            {activeTab === 'gallery' && (
              <div className="flex flex-col gap-4 py-2">
                <p className="text-xs text-slate-500 font-medium text-center">Choose from available elegant resident profile avatars</p>
                <div className="grid grid-cols-4 gap-3 max-h-[220px] overflow-y-auto p-1">
                  {AVATAR_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSelectPhoto(preset);
                        setActiveTab('options');
                        onClose();
                      }}
                      className="aspect-square rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all border border-slate-200 hover:border-primary hover:ring-2 hover:ring-primary/20 shadow-sm"
                    >
                      <img 
                        src={preset} 
                        alt={`Avatar preset ${index}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>

                {/* Direct Upload input for flexibility */}
                <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase text-center">OR ENTER CUSTOM URL</span>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        onSelectPhoto(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                        setActiveTab('options');
                        onClose();
                      }
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 outline-none text-slate-800 placeholder-slate-400 focus:border-primary"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
