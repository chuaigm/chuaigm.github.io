// script.js

// key是文件名，value是分割好的，游戏名 和 存储空间KB数字
let platforms = {};
// 用于存储当前已点击的平台
let currentSelectedPlatform = null;
// 用于主页显示所有已选择的总容量
let totalSpace = 0;
// 所有已经选择的游戏
let selectedGames = {};
// 存储每个平台已选择的空间
let selectedPlatformSpace = {};

// 读取指定平台的txt文件
async function loadGameFiles() {
    const platformFiles = [
        'atari2600.txt',
        'atari5200.txt',
        'atari7800.txt',
        'atarilynx.txt',
        'cps1.txt',
        'cps2.txt',
        'cps3.txt',
        'dos.txt',
        'dreamcast.txt',
        'famicom.txt',
        'fbneo.txt',
        'gameandwatch.txt',
        'gamegear.txt',
        'gb.txt',
        'gba.txt',
        'gbc.txt',
        'gc.txt',
        'mame.txt',
        'mastersystem.txt',
        'megadrive.txt',
        'msx.txt',
        'n3ds.txt',
        'n64.txt',
        'naomi.txt',
        'nds.txt',
        'neogeo.txt',
        'ngpc.txt',
        'pcengine.txt',
        'pcenginecd.txt',
        'pcfx.txt',
        'pico8.txt',
        'pokemini.txt',
        'ps2.txt',
        'psp.txt',
        'psvita.txt',
        'psx.txt',
        'saturn.txt',
        'sega32x.txt',
        'segacd.txt',
        'sfc.txt',
        'switch.txt',
        'virtualboy.txt',
        'wii.txt',
        'windows.txt',
        'wonderswan.txt',
        'wonderswancolor.txt'];

    // 清空选中的游戏列表和总空间
    selectedGames = {};
    totalSpace = 0;
    selectedPlatformSpace = {};  // 重置平台已选空间
    document.getElementById('selectedSpace').textContent = `当前平台：0.0 GB`;
    document.getElementById('totalSpace').textContent = `所有总计：0.0 GB`;

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
            // 初始化 selectedGames
            selectedGames[fileName] = [];
            // 初始化 selectedPlatformSpace
            selectedPlatformSpace[fileName] = 0;
        } catch (error) {
            console.error(`加载文件失败: ${fileName}`, error);
        }
    }

    renderPlatformIcons();
}

// 解析txt文件内容，处理空格和大小（KB）分隔的情况
function parseGameData(data) {
    return data.split('\n').map(line => {
        const parts = line.trim().split(/\s+(?=\(\s*\d+\s*KB\))/);
        const name = parts[0].trim();  // 游戏名称
        //const size = parts[1].replace(/[^\d]/g, '');  // 提取数字大小部分
        // 假设 parts 是分割后的数组，检查它是否有足够的元素
        let size = 0;
        if (parts.length > 1 && parts[1]) {
            size = parts[1].replace(/[^\d]/g, '');  // 提取数字大小部分
        } else {
            console.log("error line: ", line);
        }
        const sizeKB = parseInt(size, 10);  // 将容量转换为整数

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
            // 如果当前平台未被选中
            if (currentSelectedPlatform != platform) {
                // 记录当前平台
                currentSelectedPlatform = platform;
                displayPlatformGames(platform);
                // 显示当前平台已选择的空间
                document.getElementById('selectedSpace').textContent = `当前平台：${(selectedPlatformSpace[platform] / 1024 / 1024).toFixed(2)} GB`;
            }
        };

        if (!document.getElementById('sidebar').classList.contains('open') && currentSelectedPlatform != platform) {
            icon.style.display = 'none';  // 如果收起侧边栏且平台未选中，隐藏图标
        } else {
            icon.style.display = 'inline-block';  // 否则，显示平台图标
        }

        platformIconsDiv.appendChild(icon);
    });
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

// 显示游戏平台下的游戏
function displayPlatformGames(platform) {
    const gameListDiv = document.getElementById('gameList');
    gameListDiv.innerHTML = '';  // 清空当前游戏列表

    const selectedGamesForPlatform = selectedGames[platform] || [];

    platforms[platform].games.forEach(game => {
        const gameLabel = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.platform = platform;
        checkbox.dataset.game = game.name;
        checkbox.checked = selectedGamesForPlatform.includes(game.name);
        checkbox.onchange = () => {
            updateSelectedSpace(platform, game.name, checkbox.checked);
            saveSelectedGamesToGlobal(platform);
        };

        gameLabel.appendChild(checkbox);
        gameLabel.appendChild(document.createTextNode(`${game.name} (${game.sizeKB} KB)`));

        gameListDiv.appendChild(gameLabel);
    });
}

// 保存已选择的游戏到全局变量
function saveSelectedGamesToGlobal(platform) {
    const selectedGamesForPlatform = Array.from(document.querySelectorAll(`#gameList input[type="checkbox"]:checked`))
        .filter(checkbox => checkbox.dataset.platform === platform)
        .map(checkbox => checkbox.dataset.game);

    selectedGames[platform] = selectedGamesForPlatform;
}

// 更新所选游戏的空间大小
function updateSelectedSpace(platform, gameName, isSelected) {
    const game = platforms[platform].games.find(game => game.name === gameName);
    const gameSizeKB = game ? game.sizeKB : 0;

    if (isSelected) {
        selectedPlatformSpace[platform] += gameSizeKB;
    } else {
        selectedPlatformSpace[platform] -= gameSizeKB;
    }

    // 更新当前平台已选空间显示
    document.getElementById('selectedSpace').textContent = `当前平台：${(selectedPlatformSpace[platform] / 1024 / 1024).toFixed(2)} GB`;

    // 更新所有总计空间计算
    totalSpace = Object.values(selectedPlatformSpace).reduce((sum, space) => sum + space, 0);

    const totalSelectedSpaceInGB = (totalSpace / 1024 / 1024).toFixed(2);
    document.getElementById('totalSpace').textContent = `所有总计：${totalSelectedSpaceInGB} GB`;
}

// 处理全选和全不选按钮
document.getElementById('selectAllBtn').onclick = () => {
    const checkboxes = document.querySelectorAll('#gameList input[type="checkbox"]');
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
    // 这个变量有两重意思，一是表示，当前是否是全选状态，另一层，表示，接下来判断是，用例比较是否需要更改状态
    const isSelectAll = !allSelected;
    //const selectAction = isSelectAll ? true : false;

    // 批量更新checkbox的状态
    checkboxes.forEach(checkbox => {
        if (checkbox.checked !== isSelectAll) { // 只有需要更改状态的checkbox才进行处理
            checkbox.checked = isSelectAll;
            const platform = checkbox.dataset.platform;
            const gameName = checkbox.dataset.game;
            updateSelectedSpace(platform, gameName, checkbox.checked);
        }
    });

    // 更新按钮状态和文本
    document.getElementById('selectAllBtn').textContent = isSelectAll ? '全不选' : '全选';

    // 保存全选状态到全局变量
    saveSelectedGamesToGlobal(currentSelectedPlatform);
};


// 导出按钮处理
document.getElementById('exportBtn').onclick = () => {
    const zip = new JSZip();
    const date = new Date().toISOString().split('T')[0];  // 获取当前日期

    // 遍历所有平台，记录已选择的游戏
    Object.keys(selectedGames).forEach(platform => {
        const selectedGamesForPlatform = selectedGames[platform];

        const platformData = selectedGamesForPlatform.map(gameName => {
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
