import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-red-400">出了点问题</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400 text-sm">
            {error.message || '未知错误'}
          </p>
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} variant="default">
              重试
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              刷新页面
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => (
  <ReactErrorBoundary FallbackComponent={ErrorFallback}>
    {children}
  </ReactErrorBoundary>
);
