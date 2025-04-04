// script.js

let platforms = {};
// 用于存储当前已点击的平台
let currentSelectedPlatform = null;
let totalSpace = 0;
let selectedGames = {};
let allSelectedPlatforms = {};  // 新增记录所有平台已选中的数据

// 读取指定平台的txt文件
async function loadGameFiles() {
    const platformFiles = ['atari7800.txt', 'cps3.txt', 'psvita.txt', 'segacd.txt'];

    for (const fileName of platformFiles) {
        try {
            const response = await fetch(`game_list/${fileName}`);
            if (!response.ok) {
                console.error(`无法加载文件: ${fileName}`);
                continue;
            }

            const data = await response.text();
            const games = parseGameData(data);
            platforms[fileName] = { games };
        } catch (error) {
            console.error(`加载文件失败: ${fileName}`, error);
        }
    }

    renderPlatformIcons();
}

// 解析txt文件内容，处理空格和大小（KB）分隔的情况
function parseGameData(data) {
    return data.split('\n').map(line => {
        const parts = line.trim().split(/\s+(?=\d)/);  // 以第一个数字前的空格分割
        const name = parts[0];
        const sizeKB = parseInt(parts[1], 10);

        return { name, sizeKB: isNaN(sizeKB) ? 0 : sizeKB };
    }).filter(game => game.name && game.sizeKB);
}

// 渲染平台图标
function renderPlatformIcons() {
    const platformIconsDiv = document.getElementById('platformIcons');
    platformIconsDiv.innerHTML = '';  // 清空当前内容

    Object.keys(platforms).forEach(platform => {
        const icon = document.createElement('img');
        icon.src = `plat_pic/${platform.replace('.txt', '.jpg')}`;  // 图标路径
        icon.alt = platform;
        icon.title = platform;

        // 记录当前点击的平台
        icon.onclick = () => {
            // 记录当前平台
            currentSelectedPlatform = platform;
            displayPlatformGames(platform);
        };

        if (!document.getElementById('sidebar').classList.contains('open') && currentSelectedPlatform != platform) {
            icon.style.display = 'none';  // 如果收起侧边栏且平台未选中，隐藏图标
        } else {
            icon.style.display = 'inline-block';  // 否则，显示平台图标
        }

        platformIconsDiv.appendChild(icon);
    });
}

// 显示游戏平台下的游戏
function displayPlatformGames(platform) {
    const gameListDiv = document.getElementById('gameList');
    gameListDiv.innerHTML = '';  // 清空当前游戏列表

    platforms[platform].games.forEach(game => {
        const gameLabel = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.platform = platform;
        checkbox.dataset.game = game.name;
        checkbox.checked = allSelectedPlatforms[platform] && allSelectedPlatforms[platform].includes(game.name); // 预选已选择的游戏
        checkbox.onchange = updateSelectedSpace;

        gameLabel.appendChild(checkbox);
        gameLabel.appendChild(document.createTextNode(`${game.name} (${game.sizeKB} KB)`));

        gameListDiv.appendChild(gameLabel);
    });
}

// 更新所选游戏的空间大小
function updateSelectedSpace() {
    totalSpace = 0;
    selectedGames = {};

    document.querySelectorAll('#gameList input[type="checkbox"]:checked').forEach(checkbox => {
        const platform = checkbox.dataset.platform;
        const gameName = checkbox.dataset.game;

        selectedGames[platform] = selectedGames[platform] || [];
        selectedGames[platform].push(gameName);

        const game = platforms[platform].games.find(g => g.name === gameName);
        totalSpace += game.sizeKB;
    });

    const selectedSpaceInGB = (totalSpace / 1024 / 1024).toFixed(2);
    document.getElementById('selectedSpace').textContent = `当前平台已选：${selectedSpaceInGB} GB`;

    const totalSelectedSpaceInGB = (Object.values(selectedGames).flat().reduce((sum, gameName) => {
        const platform = Object.keys(selectedGames).find(p => selectedGames[p].includes(gameName));
        const game = platforms[platform].games.find(g => g.name === gameName);
        return sum + game.sizeKB;
    }, 0) / 1024 / 1024).toFixed(2);

    document.getElementById('totalSpace').textContent = `所有选则总量：${totalSelectedSpaceInGB} GB`;
}

// 切换左侧面板的显示
document.getElementById('toggleSidebarBtn').onclick = () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('toggleSidebarBtn');

    // 切换面板的状态
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('expanded');

    // 切换按钮的镜像反转效果
    toggleButton.classList.toggle('mirrored');

    renderPlatformIcons();  // 更新平台图标的显示状态
};

// 处理全选按钮
document.getElementById('selectAllBtn').onclick = () => {
    const checkboxes = document.querySelectorAll('#gameList input[type="checkbox"]');
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);

    checkboxes.forEach(checkbox => checkbox.checked = !allSelected);
    document.getElementById('selectAllBtn').textContent = allSelected ? '全选' : '全不选';
    updateSelectedSpace();
};

// 导出按钮处理
document.getElementById('exportBtn').onclick = () => {
    const zip = new JSZip();
    const date = new Date().toISOString().split('T')[0];  // 获取当前日期

    // 遍历所有平台，记录已选择的游戏
    Object.keys(selectedGames).forEach(platform => {
        const platformData = selectedGames[platform].map(gameName => {
            return `${gameName} (${platforms[platform].games.find(g => g.name === gameName).sizeKB} KB)`;
        }).join('\n');

        zip.file(`${platform.replace('.txt', '')}_selected_games.txt`, platformData);
    });

    // 创建下载链接
    zip.generateAsync({ type: "blob" }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `game_list_${date}.zip`;
        link.click();
    });
};

// 初始化
loadGameFiles();
