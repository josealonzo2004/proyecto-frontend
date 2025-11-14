import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error capturado:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
                    <div className='text-center p-8 bg-white rounded-lg shadow-lg max-w-md'>
                        <h1 className='text-2xl font-bold text-red-600 mb-4'>Error en la aplicación</h1>
                        <p className='text-gray-600 mb-2'>{this.state.error?.message || 'Ha ocurrido un error'}</p>
                        {this.state.errorInfo && (
                            <details className='text-left text-sm text-gray-500 mb-4'>
                                <summary className='cursor-pointer mb-2'>Detalles del error</summary>
                                <pre className='overflow-auto text-xs'>{this.state.errorInfo.componentStack}</pre>
                            </details>
                        )}
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null, errorInfo: null });
                                window.location.reload();
                            }}
                            className='bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700'
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
