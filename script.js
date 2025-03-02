document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".gallery img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.querySelector(".lightbox-img");
    const closeBtn = document.querySelector(".close");
    const searchTrigger = document.getElementById("search-trigger");
    const searchBox = document.getElementById("search-box");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const tagFilterLinks = document.querySelectorAll('.tag-filter input[type="checkbox"]');
    const myProfileTrigger = document.getElementById("my-profile-trigger");
    const loginModal = document.getElementById("login-modal");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("login-btn");
    const favoriteBtn = document.getElementById("favorite-btn");
    const shareBtn = document.getElementById("share-btn");
    const downloadBtn = document.getElementById("download-btn");
    let currentPhotoData = null;

    searchBox.style.display = "none";

    // 点击图片打开灯箱
    images.forEach(img => {
        img.addEventListener("click", function () {
            lightbox.style.display = "flex";
            lightboxImg.src = this.src;
            currentPhotoData = {
                src: this.src,
                alt: this.alt,
                tags: this.parentElement.dataset.tags,
                desc: this.parentElement.dataset.description
            };
            updateFavoriteButton();
            updateButtonVisibility();
        });
    });

    // 关闭灯箱
    closeBtn.addEventListener("click", function () {
        lightbox.style.display = "none";
    });

    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
        }
    });

    // 点击搜索按钮弹出搜索框
    searchTrigger.addEventListener("click", function (e) {
        e.stopPropagation(); 
        if (searchBox.style.display === "none" || searchBox.style.display === "") {
            searchBox.style.display = "flex";
        } else {
            searchBox.style.display = "none";
        }
    });

    // 定义搜索函数
    function performSearch() {
        const keyword = searchInput.value.trim().toLowerCase();
        const photos = document.querySelectorAll('.photo');
        photos.forEach(photo => {
            const tags = photo.dataset.tags.toLowerCase();
            const description = photo.dataset.description.toLowerCase();
            if (tags.includes(keyword) || description.includes(keyword)) {
                photo.style.display = 'block';
            } else {
                photo.style.display = 'none';
            }
        });
    }

    // 点击搜索按键进行搜索
    searchBtn.addEventListener("click", performSearch);

    // 输入框按回车键执行搜索
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 处理标签筛选
    tagFilterLinks.forEach(link => {
        link.addEventListener('change', function (e) {
            const selectedValues = Array.from(tagFilterLinks)
               .filter(input => input.checked)
               .map(input => input.value);
            const photos = document.querySelectorAll('.photo');
            photos.forEach(photo => {
                const tags = photo.dataset.tags.split(' ');
                const shouldShow = selectedValues.some(value => tags.includes(value)) || selectedValues.length === 0;
                photo.style.display = shouldShow ? 'block' : 'none';
            });
        });
    });

    // 更新收藏按钮状态
    function updateFavoriteButton() {
        if (!isLoggedIn()) {
            favoriteBtn.style.display = "none";
            return;
        }
        
        const favorites = getFavorites();
        const isFavorited = favorites.some(item => item.src === currentPhotoData.src);
        
        favoriteBtn.style.display = "block";
        favoriteBtn.classList.toggle("added", isFavorited);
        favoriteBtn.textContent = isFavorited ? "✔ 已收藏" : "❤ 收藏";
    }

    // 更新按钮可见性（仅登录用户可见）
    function updateButtonVisibility() {
        if (!isLoggedIn()) {
            favoriteBtn.style.display = "none";
            shareBtn.style.display = "none";
            downloadBtn.style.display = "none";
        } else {
            favoriteBtn.style.display = "block";
            shareBtn.style.display = "block";
            downloadBtn.style.display = "block";
        }
    }

    // 获取当前用户收藏
    function getFavorites() {
        const username = localStorage.getItem("currentUser");
        return JSON.parse(localStorage.getItem(`favorites_${username}`)) || [];
    }

    // 保存收藏数据
    function saveFavorites(items) {
        const username = localStorage.getItem("currentUser");
        localStorage.setItem(`favorites_${username}`, JSON.stringify(items));
    }

    // 收藏按钮点击事件
    favoriteBtn.addEventListener("click", function() {
        const favorites = getFavorites();
        const index = favorites.findIndex(item => item.src === currentPhotoData.src);

        if (index === -1) {
            favorites.push(currentPhotoData);
        } else {
            favorites.splice(index, 1);
        }

        saveFavorites(favorites);
        updateFavoriteButton();
    });

    // 分享功能：复制链接并提示
    shareBtn.addEventListener("click", function () {
        navigator.clipboard.writeText(currentPhotoData.src)
            .then(() => {
                alert('图片链接已复制到剪贴板！');
            })
            .catch(err => {
                console.error('复制失败', err);
                alert('复制失败，请手动复制链接。');
            });
    });

    // 下载功能
    downloadBtn.addEventListener("click", function () {
        const link = document.createElement('a');
        link.href = currentPhotoData.src;
        link.download = `${currentPhotoData.alt || 'image'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 预设的用户名和密码
    const presetUsername = "qiancheng";
    const presetPassword = "123456";

    // 检查是否已经登录
    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // 登录按钮点击事件
    loginBtn.addEventListener("click", function () {
        const username = usernameInput.value;
        const password = passwordInput.value;

    // 验证用户名和密码
        if (username === presetUsername && password === presetPassword) {
            localStorage.setItem('currentUser', username);
            localStorage.setItem('isLoggedIn', 'true');
            loginModal.style.display = 'none';
            window.location.href = 'myprofile.html';
        } else {
            alert('用户名或密码错误，请重新输入。');
        }
    });

    // 我的按钮点击事件
    myProfileTrigger.addEventListener("click", function (e) {
        e.preventDefault();
        if (isLoggedIn()) {
            window.location.href = 'myprofile.html';
        } else {
            loginModal.style.display = 'flex';
        }
    });
});