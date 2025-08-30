

import React, { useEffect } from 'react';
import { MicrophoneIcon, XIcon } from '../constants';

const Spinner: React.FC = () => (
  <div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-600 border-t-emerald-500 rounded-full animate-spin"></div>
);

const SuccessIcon: React.FC = () => (
    <svg className="h-16 w-16 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ErrorIcon: React.FC = () => (
    <svg className="h-16 w-16 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface VoiceCommandModalProps {
    status: 'listening' | 'processing' | 'success' | 'error';
    message: string;
    transcript?: string;
    onClose: () => void;
}

const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({ status, message, transcript, onClose }) => {

    useEffect(() => {
        if (status === 'success' || status === 'error') {
            const timer = setTimeout(() => {
                onClose();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [status, onClose]);
    
    const renderContent = () => {
        switch(status) {
            case 'listening':
                return (
                    <>
                        <div className="relative w-24 h-24 text-white">
                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping"></div>
                            <div className="relative w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center">
                                <MicrophoneIcon />
                            </div>
                        </div>
                        <p className="text-2xl font-semibold mt-6">{message}</p>
                    </>
                );
            case 'processing':
                 return (
                    <>
                        <Spinner />
                        <p className="text-xl font-semibold mt-6">{message}</p>
                        {transcript && <p className="text-lg text-slate-400 mt-2">"{transcript}"</p>}
                    </>
                );
            case 'success':
                 return (
                    <>
                        <SuccessIcon />
                        <p className="text-xl font-semibold mt-4 text-center">{message}</p>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <ErrorIcon />
                        <p className="text-xl font-semibold mt-4 text-center">{message}</p>
                    </>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-100/90 dark:bg-slate-900/90 z-50 flex flex-col items-center justify-center text-slate-800 dark:text-white p-4" onClick={onClose}>
            <div className="absolute top-4 right-4">
                 <button onClick={onClose} className="text-slate-600 dark:text-white opacity-70 hover:opacity-100">
                    <XIcon />
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default VoiceCommandModal;