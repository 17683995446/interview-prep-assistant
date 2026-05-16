import { Toaster as HotToaster } from 'react-hot-toast';

export const Toaster = () => (
  <HotToaster
    position="bottom-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: '#1a1a2e',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      },
      success: {
        style: {
          background: '#10b98120',
          color: '#34d399',
          border: '1px solid #10b98130',
        },
      },
      error: {
        style: {
          background: '#ef444420',
          color: '#f87171',
          border: '1px solid #ef444430',
        },
      },
    }}
  />
);
