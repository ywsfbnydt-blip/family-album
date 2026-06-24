// ============================================
// Custom Media Gallery JavaScript
// ============================================

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dzlclwscb';
const CLOUDINARY_UPLOAD_PRESET = 'family_album';

// Storage for media items
let mediaItems = {
    images: [],
    music: [],
    videos: [],
    files: []
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeMediaGallery();
    setupEventListeners();
    loadMediaFromStorage();
    updateStatistics();
});

// Initialize media gallery
function initializeMediaGallery() {
    console.log('Initializing media gallery...');
    // Load from localStorage if available
    const stored = localStorage.getItem('mediaItems');
    if (stored) {
        mediaItems = JSON.parse(stored);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Image upload
    document.getElementById('imageUpload').addEventListener('change', (e) => {
        handleImageUpload(e.target.files);
    });

    // Music upload
    document.getElementById('musicUpload').addEventListener('change', (e) => {
        handleMusicUpload(e.target.files);
    });

    // Video upload
    document.getElementById('videoUpload').addEventListener('change', (e) => {
        handleVideoUpload(e.target.files);
    });

    // File upload
    document.getElementById('fileUpload').addEventListener('change', (e) => {
        handleFileUpload(e.target.files);
    });

    // Search functionality
    document.getElementById('imageSearch').addEventListener('input', (e) => {
        filterImages(e.target.value);
    });

    document.getElementById('musicSearch').addEventListener('input', (e) => {
        filterMusic(e.target.value);
    });

    document.getElementById('videoSearch').addEventListener('input', (e) => {
        filterVideos(e.target.value);
    });

    document.getElementById('fileSearch').addEventListener('input', (e) => {
        filterFiles(e.target.value);
    });

    // Lightbox close
    document.getElementById('imageLightbox').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });

    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('imageLightbox').classList.remove('active');
    });
}

// Handle image upload
function handleImageUpload(files) {
    showUploadModal();
    let uploadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            uploadToCloudinary(file, 'image', (url) => {
                const imageItem = {
                    id: Date.now() + index,
                    name: file.name,
                    url: url,
                    size: formatFileSize(file.size),
                    type: 'image',
                    uploadedAt: new Date().toLocaleString('ar-SA')
                };
                mediaItems.images.push(imageItem);
                uploadedCount++;
                updateProgress(uploadedCount, totalFiles);

                if (uploadedCount === totalFiles) {
                    saveMediaToStorage();
                    displayImages();
                    updateStatistics();
                    hideUploadModal();
                    showNotification('تم رفع الصور بنجاح!', 'success');
                }
            });
        }
    });
}

// Handle music upload
function handleMusicUpload(files) {
    showUploadModal();
    let uploadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('audio/')) {
            uploadToCloudinary(file, 'video', (url) => {
                const musicItem = {
                    id: Date.now() + index,
                    name: file.name,
                    url: url,
                    size: formatFileSize(file.size),
                    type: 'music',
                    uploadedAt: new Date().toLocaleString('ar-SA')
                };
                mediaItems.music.push(musicItem);
                uploadedCount++;
                updateProgress(uploadedCount, totalFiles);

                if (uploadedCount === totalFiles) {
                    saveMediaToStorage();
                    displayMusic();
                    updateStatistics();
                    hideUploadModal();
                    showNotification('تم رفع الموسيقى بنجاح!', 'success');
                }
            });
        }
    });
}

// Handle video upload
function handleVideoUpload(files) {
    showUploadModal();
    let uploadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('video/')) {
            uploadToCloudinary(file, 'video', (url) => {
                const videoItem = {
                    id: Date.now() + index,
                    name: file.name,
                    url: url,
                    size: formatFileSize(file.size),
                    type: 'video',
                    uploadedAt: new Date().toLocaleString('ar-SA')
                };
                mediaItems.videos.push(videoItem);
                uploadedCount++;
                updateProgress(uploadedCount, totalFiles);

                if (uploadedCount === totalFiles) {
                    saveMediaToStorage();
                    displayVideos();
                    updateStatistics();
                    hideUploadModal();
                    showNotification('تم رفع الفيديوهات بنجاح!', 'success');
                }
            });
        }
    });
}

// Handle file upload
function handleFileUpload(files) {
    showUploadModal();
    let uploadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach((file, index) => {
        uploadToCloudinary(file, 'raw', (url) => {
            const fileItem = {
                id: Date.now() + index,
                name: file.name,
                url: url,
                size: formatFileSize(file.size),
                type: 'file',
                uploadedAt: new Date().toLocaleString('ar-SA')
            };
            mediaItems.files.push(fileItem);
            uploadedCount++;
            updateProgress(uploadedCount, totalFiles);

            if (uploadedCount === totalFiles) {
                saveMediaToStorage();
                displayFiles();
                updateStatistics();
                hideUploadModal();
                showNotification('تم رفع الملفات بنجاح!', 'success');
            }
        });
    });
}

// Upload to Cloudinary
function uploadToCloudinary(file, resourceType, callback) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', resourceType);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType === 'raw' ? 'raw' : resourceType}/upload`;

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.secure_url) {
            callback(data.secure_url);
        } else {
            showNotification('خطأ في الرفع', 'error');
            console.error('Upload error:', data);
        }
    })
    .catch(error => {
        showNotification('خطأ في الاتصال', 'error');
        console.error('Upload error:', error);
    });
}

// Display images
function displayImages() {
    const grid = document.getElementById('imagesGrid');
    
    if (mediaItems.images.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>لا توجد صور حالياً</p></div>';
        return;
    }

    grid.innerHTML = mediaItems.images.map(image => `
        <div class="image-card" onclick="openLightbox('${image.url}')">
            <img src="${image.url}" alt="${image.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23333%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage%3C/text%3E%3C/svg%3E'">
            <div class="image-overlay">
                <div class="image-info">
                    <div class="image-name">${image.name}</div>
                    <div class="image-size">${image.size}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Display music
function displayMusic() {
    const list = document.getElementById('musicList');
    
    if (mediaItems.music.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>لا توجد مسارات موسيقية حالياً</p></div>';
        return;
    }

    list.innerHTML = mediaItems.music.map(music => `
        <div class="music-item">
            <div class="music-player">
                <audio controls>
                    <source src="${music.url}" type="audio/mpeg">
                    متصفحك لا يدعم عنصر الصوت
                </audio>
            </div>
            <div class="music-info">
                <div class="music-title">${music.name}</div>
                <div class="music-artist">${music.size}</div>
            </div>
        </div>
    `).join('');
}

// Display videos
function displayVideos() {
    const grid = document.getElementById('videosGrid');
    
    if (mediaItems.videos.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>لا توجد فيديوهات حالياً</p></div>';
        return;
    }

    grid.innerHTML = mediaItems.videos.map(video => `
        <div class="video-card">
            <div class="video-player">
                <video controls poster="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23000%22 width=%22300%22 height=%22200%22/%3E%3C/svg%3E">
                    <source src="${video.url}" type="video/mp4">
                    متصفحك لا يدعم عنصر الفيديو
                </video>
            </div>
            <div class="video-info">
                <div class="video-title">${video.name}</div>
                <div class="video-duration">${video.size}</div>
            </div>
        </div>
    `).join('');
}

// Display files
function displayFiles() {
    const list = document.getElementById('filesList');
    
    if (mediaItems.files.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>لا توجد ملفات حالياً</p></div>';
        return;
    }

    list.innerHTML = mediaItems.files.map(file => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">${getFileIcon(file.name)}</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${file.size}</div>
                </div>
            </div>
            <div class="file-actions">
                <a href="${file.url}" download class="file-btn">تحميل</a>
                <button class="file-btn" onclick="deleteFile(${file.id})">حذف</button>
            </div>
        </div>
    `).join('');
}

// Filter images
function filterImages(query) {
    const filtered = mediaItems.images.filter(img => 
        img.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const grid = document.getElementById('imagesGrid');
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>لا توجد نتائج</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(image => `
        <div class="image-card" onclick="openLightbox('${image.url}')">
            <img src="${image.url}" alt="${image.name}">
            <div class="image-overlay">
                <div class="image-info">
                    <div class="image-name">${image.name}</div>
                    <div class="image-size">${image.size}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter music
function filterMusic(query) {
    const filtered = mediaItems.music.filter(music => 
        music.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const list = document.getElementById('musicList');
    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>لا توجد نتائج</p></div>';
        return;
    }

    list.innerHTML = filtered.map(music => `
        <div class="music-item">
            <div class="music-player">
                <audio controls>
                    <source src="${music.url}" type="audio/mpeg">
                </audio>
            </div>
            <div class="music-info">
                <div class="music-title">${music.name}</div>
                <div class="music-artist">${music.size}</div>
            </div>
        </div>
    `).join('');
}

// Filter videos
function filterVideos(query) {
    const filtered = mediaItems.videos.filter(video => 
        video.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const grid = document.getElementById('videosGrid');
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>لا توجد نتائج</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(video => `
        <div class="video-card">
            <div class="video-player">
                <video controls>
                    <source src="${video.url}" type="video/mp4">
                </video>
            </div>
            <div class="video-info">
                <div class="video-title">${video.name}</div>
                <div class="video-duration">${video.size}</div>
            </div>
        </div>
    `).join('');
}

// Filter files
function filterFiles(query) {
    const filtered = mediaItems.files.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const list = document.getElementById('filesList');
    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>لا توجد نتائج</p></div>';
        return;
    }

    list.innerHTML = filtered.map(file => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">${getFileIcon(file.name)}</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${file.size}</div>
                </div>
            </div>
            <div class="file-actions">
                <a href="${file.url}" download class="file-btn">تحميل</a>
                <button class="file-btn" onclick="deleteFile(${file.id})">حذف</button>
            </div>
        </div>
    `).join('');
}

// Open lightbox
function openLightbox(url) {
    const lightbox = document.getElementById('imageLightbox');
    document.getElementById('lightboxImage').src = url;
    lightbox.classList.add('active');
}

// Delete file
function deleteFile(id) {
    if (confirm('هل تريد حذف هذا الملف؟')) {
        mediaItems.files = mediaItems.files.filter(f => f.id !== id);
        saveMediaToStorage();
        displayFiles();
        updateStatistics();
        showNotification('تم حذف الملف', 'success');
    }
}

// Update statistics
function updateStatistics() {
    document.getElementById('imageCount').textContent = mediaItems.images.length;
    document.getElementById('musicCount').textContent = mediaItems.music.length;
    document.getElementById('videoCount').textContent = mediaItems.videos.length;
    document.getElementById('fileCount').textContent = mediaItems.files.length;
}

// Save media to storage
function saveMediaToStorage() {
    localStorage.setItem('mediaItems', JSON.stringify(mediaItems));
}

// Load media from storage
function loadMediaFromStorage() {
    displayImages();
    displayMusic();
    displayVideos();
    displayFiles();
}

// Show upload modal
function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('uploadStatus').textContent = '0%';
}

// Hide upload modal
function hideUploadModal() {
    setTimeout(() => {
        document.getElementById('uploadModal').classList.remove('active');
    }, 1000);
}

// Update progress
function updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('uploadStatus').textContent = percentage + '%';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file icon
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'zip': '📦',
        'rar': '📦',
        'txt': '📋',
        'ppt': '🎯',
        'pptx': '🎯'
    };
    return icons[ext] || '📁';
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
