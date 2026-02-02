// components/admin/SecureSnapshotImage.jsx
import { useState, useEffect } from "react";
import { getSnapshotImage } from "../../api/examApi";

function SecureSnapshotImage({ snapshotId, alt, className }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadImage = async () => {
      try {
        if (!snapshotId) {
          setError(true);
          setLoading(false);
          return;
        }

        const response = await getSnapshotImage(snapshotId);
        
        if (!isMounted) return;
        
        if (response.data) {
          const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' });
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading snapshot image:", err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup function
    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [snapshotId]);

  if (loading) {
    return (
      <div className={`image-loading ${className || ''}`}>
        <div className="loading-spinner"></div>
        <span>Loading image...</span>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`image-error ${className || ''}`}>
        <div className="error-icon">⚠️</div>
        <span>Image not available</span>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt || `Snapshot ${snapshotId?.substring(0, 8)}...`}
      className={className}
      onError={() => setError(true)}
    />
  );
}

export default SecureSnapshotImage;