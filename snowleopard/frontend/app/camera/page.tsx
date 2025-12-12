'use client';

import { useEffect, useRef, useState } from 'react';

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [stockInfo, setStockInfo] = useState<string>('');
  const [identifiedItem, setIdentifiedItem] = useState<string>('');

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
        setError('');
      }
    } catch (err) {
      setError('Failed to access camera. Please grant camera permissions.');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    setIsProcessing(true);
    setError('');
    setAnalysisResult('');
    setStockInfo('');
    setIdentifiedItem('');

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (!blob) {
        throw new Error('Failed to capture image');
      }

      // Download the image locally
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `snapshot-${timestamp}.png`;
      link.click();
      URL.revokeObjectURL(url);

      // Send to API for processing
      const formData = new FormData();
      formData.append('image', blob, `snapshot-${timestamp}.png`);

      const response = await fetch('/api/preprocess', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      const itemName = data.analysis;
      setAnalysisResult(itemName);
      setIdentifiedItem(itemName);

      // Query stock information if item was identified
      if (itemName && itemName !== 'No matching items found') {
        console.log('Querying stock for item:', itemName);

        const queryResponse = await fetch('/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ item: itemName }),
        });

        const queryData = await queryResponse.json();
        console.log('Query response:', queryData);

        if (queryResponse.ok) {
          if (queryData.stockInfo) {
            setStockInfo(queryData.stockInfo);
            console.log('Stock info set:', queryData.stockInfo);
          } else {
            setStockInfo('No stock information available');
          }
        } else {
          console.error('Stock query failed:', queryData.error);
          setStockInfo(`Error: ${queryData.error || 'Failed to retrieve stock information'}`);
        }
      } else {
        console.log('No valid item to query:', itemName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process snapshot');
      console.error('Error taking snapshot:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Camera Snapshot
          </h1>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }}
            />
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <p>Camera not active</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={takeSnapshot}
              disabled={!isCameraActive || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Take Snapshot'}
            </button>

            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              disabled={isProcessing}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </button>
          </div>

          {analysisResult && (
            <div className="mt-6 space-y-4">
              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Identified Item
                </h2>
                <p className="text-gray-200 text-lg font-medium">
                  {analysisResult}
                </p>
              </div>

              <div className="bg-blue-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Stock Information
                </h2>
                {isProcessing ? (
                  <p className="text-gray-300 italic">Loading stock information...</p>
                ) : stockInfo ? (
                  <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                    {stockInfo}
                  </p>
                ) : (
                  <p className="text-gray-300 italic">Querying stock data...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for snapshot processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
