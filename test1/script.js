document.addEventListener('DOMContentLoaded', function () {
    const sideMenu = document.getElementById('side-menu');
    const toggleBtn = document.getElementById('toggle-btn');
    const platformIconsContainer = document.getElementById('platform-icons');
    const gameListContainer = document.getElementById('game-list');

    toggleBtn.addEventListener('click', function () {
        sideMenu.classList.toggle('open');
    });

    // 获取平台列表并加载平台图标
    async function loadPlatforms() {
        const platformFiles = await fetchPlatformFiles();
        platformFiles.forEach(platformName => {
            const platformIcon = document.createElement('img');
            platformIcon.src = `plat_pic/${platformName}.jpg`; // 假设图标命名与平台名一致
            platformIcon.alt = platformName;
            platformIcon.addEventListener('click', function () {
                loadGames(platformName);
                sideMenu.classList.remove('open');
            });
            platformIconsContainer.appendChild(platformIcon);
        });
    }

    // 获取 game_list 文件夹下的所有 JSON 文件
    async function fetchPlatformFiles() {
        // 假设有一个接口可以列出 game_list 文件夹内的文件名
        // 由于浏览器环境无法直接列出文件夹内的文件名，这里你可能需要通过服务器端 API 实现
        // 下面是模拟文件读取的方法：
        return ['atari7800', 'cps3', 'psvita', 'segacd']; // 示例平台名数组
    }

    // 加载并显示平台的游戏列表
    async function loadGames(platformName) {
        gameListContainer.innerHTML = ''; // 清空当前游戏列表

        // 加载平台对应的 JSON 文件
        const platformData = await fetch(`game_list/${platformName}.json`)
            .then(response => response.json())
            .catch(err => {
                console.error('加载平台数据失败', err);
                return { games: [] };
            });

        const header = document.createElement('h2');
        header.innerText = `${platformName} 的游戏列表`;
        gameListContainer.appendChild(header);

        platformData.games.forEach(game => {
            const gameItem = document.createElement('div');
            const [gameName, size] = game.split("\t");
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = gameName;
            
            const label = document.createElement('label');
            label.setAttribute('for', gameName);
            label.innerText = `${gameName} (${size})`;

            gameItem.appendChild(checkbox);
            gameItem.appendChild(label);
            gameListContainer.appendChild(gameItem);
        });
    }

    // 初始化加载平台列表
    loadPlatforms();
});
