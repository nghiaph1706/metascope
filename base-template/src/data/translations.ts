export type Language = 'en' | 'vi';

export interface Translations {
  // Common / Navigation
  brandName: string;
  brandSub: string;
  searchPlaceholder: string;
  joinElite: string;
  eliteMember: string;
  liveAlerts: string;
  newAlerts: string;
  footerRights: string;
  footerTrademark: string;

  // Nav Items
  navHome: string;
  navMeta: string;
  navStats: string;
  navLive: string;
  navPatch: string;
  navItems: string;
  navCreator: string;
  navCreate: string;

  // Home View
  homeHeroTitle: string;
  homeHeroSub: string;
  homeSearchButton: string;
  homeTrendingGuides: string;
  homeViewAll: string;
  homeQuickLinks: string;
  homeQuickLinkSummoners: string;
  homeQuickLinkTier: string;
  homeLiveMetaSub: string;

  // Tier List View
  tierMetaTitle: string;
  tierMetaSub: string;
  tierSearchPlaceholder: string;
  tierColumnTier: string;
  tierColumnComp: string;
  tierColumnAvg: string;
  tierColumnWin: string;
  tierColumnTop4: string;
  tierColumnPick: string;
  tierColumnCarryTank: string;
  tierColumnAction: string;
  tierNoFallback: string;
  tierAdjustFilters: string;
  tierDifficultyEasy: string;
  tierDifficultyMedium: string;
  tierDifficultyHard: string;

  // Guide Details View
  guideBackBtn: string;
  guideOverview: string;
  guideBoardLayout: string;
  guideSwipeNotice: string;
  guideEnemyAbove: string;
  guideStagePriority: string;
  guideEarlyMidCarousel: string;
  guideCarouselPriority: string;
  guidePlaystyleGuide: string;
  guideAuthor: string;

  // Create Guide View
  createTitle: string;
  createSub: string;
  createFormTitlePlaceholder: string;
  createPlaceholderPlaystyle: string;
  createPlaceholderDescription: string;
  createSelectDifficulty: string;
  createLabelDifficulty: string;
  createSelectTier: string;
  createLabelTier: string;
  createCarryChampions: string;
  createTankChampions: string;
  createAddUnitBtn: string;
  createBoardHeading: string;
  createBoardSub: string;
  createRegistryHeading: string;
  createRegistrySub: string;
  createButtonSave: string;
  clearBtn: string;
  unitAnalystTitle: string;
  unitAnalystSub: string;
  affiliatedTraits: string;

  // Creator Hub
  hubTitle: string;
  hubSub: string;
  hubStatViews: string;
  hubStatUpvotes: string;
  hubStatShares: string;
  hubStatCopies: string;
  hubGuidesTab: string;
  hubAnalyticsTab: string;
  hubRevenueTab: string;
  hubCreatedGuides: string;
  hubNoGuides: string;
  hubNoGuidesSub: string;
  hubDraftActionDelete: string;
  hubDraftActionDuplicate: string;
  hubLedgerTitle: string;
  hubLedgerSwipe: string;

  // Profile View
  profileRankDetails: string;
  profileWinRate: string;
  profileTop4Rate: string;
  profileAvgPlacement: string;
  profileGamesPlayed: string;
  profileMatchHistory: string;
  profileSearchTitle: string;

  // Patch Notes View
  patchTitle: string;
  patchReleaseDate: string;
  patchItemImpact: string;

  // Live Tracker View
  liveTrackerTitle: string;
  liveTrackerSub: string;
  liveLobbyRoster: string;
  liveHotStreak: string;
  liveDangerLevel: string;
  livePredictedPlace: string;
}

export const EXHAUSTIVE_TRANSLATIONS: Record<Language, Translations> = {
  en: {
    brandName: "METASCOPE",
    brandSub: "INTEL SYSTEM",
    searchPlaceholder: "Search Summoner / Comp...",
    joinElite: "Join Elite",
    eliteMember: "Elite Member",
    liveAlerts: "Live Alerts",
    newAlerts: "2 New",
    footerRights: "METASCOPE © 2026 ELITE INTEL SYSTEM INC. ALL DATA EXTRACTED FROM ENCRYPTED CHAMPION CORE REGISTRIES.",
    footerTrademark: "Teamfight Tactics is a registered trademark of Riot Games. MetaScope is built standalone not affiliated.",

    navHome: "Home",
    navMeta: "TFT Set Meta",
    navStats: "Player Stats",
    navLive: "Live Lobby",
    navPatch: "Patch Notes 14.6",
    navItems: "Item Cheat Sheet",
    navCreator: "Creator Hub",
    navCreate: "Create Guide",

    homeHeroTitle: "Master the TFT Convergence with Encrypted Datatracks",
    homeHeroSub: "Real-time winrates, localized tactical boards, high-fidelity synergy simulation, and telemetry streams.",
    homeSearchButton: "Analyze Profile",
    homeTrendingGuides: "Trending S-Tier Compositions",
    homeViewAll: "View All Compositions",
    homeQuickLinks: "Quick Intelligence Links",
    homeQuickLinkSummoners: "Top ELO Summoners",
    homeQuickLinkTier: "Meta Set Tier List",
    homeLiveMetaSub: "Live Match Registries",

    tierMetaTitle: "Set 11 Elite Compositions",
    tierMetaSub: "Statistically authenticated meta rosters extracted directly from tactical simulator clusters.",
    tierSearchPlaceholder: "Filter by traits or champion name...",
    tierColumnTier: "TIER",
    tierColumnComp: "COMPOSITION NAME",
    tierColumnAvg: "AVG PLACE",
    tierColumnWin: "WIN %",
    tierColumnTop4: "TOP 4 %",
    tierColumnPick: "PICK RATE %",
    tierColumnCarryTank: "PRIMARY CARRY / TANK",
    tierColumnAction: "ACTION",
    tierNoFallback: "No team compositions fallback matching this filter",
    tierAdjustFilters: "Adjust search keys or tier rankings to evaluate other combinations.",
    tierDifficultyEasy: "EASY",
    tierDifficultyMedium: "MEDIUM",
    tierDifficultyHard: "HARD",

    guideBackBtn: "Back to Tier List",
    guideOverview: "Tactical Overview & Metrics",
    guideBoardLayout: "Precision Hexagonal Board Layout",
    guideSwipeNotice: "Swipe horizontally to view full board",
    guideEnemyAbove: "ENEMY UNITS ARE ABOVE",
    guideStagePriority: "Stage Transition Priorities",
    guideEarlyMidCarousel: "Early/Mid game setups & item carousel preferences",
    guideCarouselPriority: "Carousel Priorities",
    guidePlaystyleGuide: "Operational Playstyle Guide",
    guideAuthor: "Intelligence Log Author",

    createTitle: "Forge Elite Strategy Guide",
    createSub: "Deploy simulated compositions, configure hex placements, define early stages, and publish.",
    createFormTitlePlaceholder: "Elite Composition Name (e.g., Fated Syndra Heavy Carry)",
    createPlaceholderPlaystyle: "Operation Playstyle instructions (e.g. Slowroll at level 7 for Diana & Janna 3-star)",
    createPlaceholderDescription: "Strategic notes, absolute core itemizations, and positioning secrets...",
    createSelectDifficulty: "SELECT DIFFICULTY",
    createLabelDifficulty: "DIFFICULTY LEVEL",
    createSelectTier: "SELECT TIER STATUS",
    createLabelTier: "TARGET TIER STATUS",
    createCarryChampions: "CARRY CHAMPIONS",
    createTankChampions: "TANK CHAMPIONS",
    createAddUnitBtn: "Deploy Selected Champion",
    createBoardHeading: "Hex board custom blueprint",
    createBoardSub: "Select a champion in the registry below, then click any hex node above to place.",
    createRegistryHeading: "Global Active Champion Registry",
    createRegistrySub: "Filter and tap any champion card below to select or stage them for hex deployment.",
    createButtonSave: "Deploy & Save Blueprint",
    clearBtn: "Clear",
    unitAnalystTitle: "UNIT ANALYST PANEL",
    unitAnalystSub: "Select a champion from the registry grid to inspect their tier cost, composite traits, and direct abilities.",
    affiliatedTraits: "Affiliated Traits",

    hubTitle: "Creator Strategic Hub",
    hubSub: "Monitor distribution stats, transaction ledgers, and manage your custom blueprints.",
    hubStatViews: "TOTAL VIEWPORTS",
    hubStatUpvotes: "BLUEPRINT UPVOTES",
    hubStatShares: "SOCIAL DISTRIBUTION",
    hubStatCopies: "TACTICAL IMPORT COPIES",
    hubGuidesTab: "BLUEPRINTS & GUIDES",
    hubAnalyticsTab: "DATA ANALYTICS",
    hubRevenueTab: "CREATOR ALLOCATIONS",
    hubCreatedGuides: "Personal Blueprints & Guides",
    hubNoGuides: "No custom blueprints found",
    hubNoGuidesSub: "Create a guide to start generating viewership telemetry and monthly allocations.",
    hubDraftActionDelete: "DELETE",
    hubDraftActionDuplicate: "DUPLICATE",
    hubLedgerTitle: "Transactional Ledger",
    hubLedgerSwipe: "Swipe horizontal to view status",

    profileRankDetails: "Tactical Rank Authorization",
    profileWinRate: "WIN RATE",
    profileTop4Rate: "TOP 4 RATE",
    profileAvgPlacement: "AVG PLACEMENT",
    profileGamesPlayed: "GAMES ANALYZED",
    profileMatchHistory: "Historical Combat Analytics",
    profileSearchTitle: "Summoner Intelligence Lookup",

    patchTitle: "Meta Changelog System",
    patchReleaseDate: "CONVERGENCE PATCH UPDATE SYSTEM • EFFECTIVE DATE",
    patchItemImpact: "TACTICAL EXPLOIT INTERPRETATION",

    liveTrackerTitle: "Dynamic Live Lobby Sync",
    liveTrackerSub: "Synchronize current active game lobbies to inspect match participants in real-time.",
    liveLobbyRoster: "Active Lobby Participant Roster",
    liveHotStreak: "STREAK",
    liveDangerLevel: "DANGER",
    livePredictedPlace: "PREDICTED"
  },
  vi: {
    brandName: "METASCOPE",
    brandSub: "HỆ THỐNG PHÂN TÍCH",
    searchPlaceholder: "Tìm kiếm thông tin Anh Hùng / Đội Hình...",
    joinElite: "Gia Nhập Elite",
    eliteMember: "Thành Viên Elite",
    liveAlerts: "Cảnh Báo Trực Tiếp",
    newAlerts: "2 Tin Mới",
    footerRights: "METASCOPE © 2026 TẬP ĐOÀN HỆ THỐNG ELITE. TẤT CẢ DỮ LIỆU ĐƯỢC TRÍCH XUẤT TỪ HỆ THỐNG MÃ HÓA CHAMPION.",
    footerTrademark: "Teamfight Tactics (ĐTCL) là thương hiệu đã đăng ký của Riot Games. MetaScope được phát triển độc lập.",

    navHome: "Trang Chủ",
    navMeta: "Đội Hình Meta ĐTCL",
    navStats: "Lịch Sử Đấu",
    navLive: "Theo Dõi Phòng Đấu",
    navPatch: "Thông Tin Bản Cập Nhật 14.6",
    navItems: "Ghép Trang Bị",
    navCreator: "Trung Tâm Sáng Tạo",
    navCreate: "Tạo Đội Hình",

    homeHeroTitle: "Làm Chủ Đấu Trường Chân Lý Với Phân Tích Mã Hóa",
    homeHeroSub: "Tỉ lệ thắng trực tiếp, sơ đồ bàn cờ trực quan, mô phỏng kích hoạt tộc hệ thời gian thực và luồng dữ liệu ELO.",
    homeSearchButton: "Phân Tích Hồ Sơ",
    homeTrendingGuides: "Đội Hình Meta S-Tier Xu Hướng",
    homeViewAll: "Xem Tất Cả Sơ Đồ Đội Hình",
    homeQuickLinks: "Liên Kết Phân Tích Nhanh",
    homeQuickLinkSummoners: "Cao Thủ Hàng Đầu",
    homeQuickLinkTier: "Bảng Xếp Hạng Meta",
    homeLiveMetaSub: "Hồ Sơ Trận Đấu Trực Tiếp",

    tierMetaTitle: "Đội Hình Xu Hướng Mùa 11",
    tierMetaSub: "Được xác thực thống kê từ các máy chủ mô phỏng chiến thuật của các cao thủ hàng đầu.",
    tierSearchPlaceholder: "Lọc theo tộc hệ hoặc tên tướng...",
    tierColumnTier: "BẬC TIER",
    tierColumnComp: "TÊN ĐỘI HÌNH CHIẾN THUẬT",
    tierColumnAvg: "XẾP HẠNG TB",
    tierColumnWin: "TỶ LỆ THẮNG",
    tierColumnTop4: "TỶ LỆ TOP 4",
    tierColumnPick: "TỶ LỆ CHỌN %",
    tierColumnCarryTank: "THỦ LĨNH GÁNH TEAM / CHỐNG CHỊU",
    tierColumnAction: "CHI TIẾT",
    tierNoFallback: "Không tìm thấy đội hình nào phù hợp với bộ lọc",
    tierAdjustFilters: "Vui lòng nhập từ khóa khác hoặc điều chỉnh bộ lọc để xem thêm.",
    tierDifficultyEasy: "DỄ",
    tierDifficultyMedium: "TRUNG BÌNH",
    tierDifficultyHard: "KHÓ",

    guideBackBtn: "Trở lại Bảng Xếp Hạng",
    guideOverview: "Tổng Quan Chiến Thuật & Thông Số",
    guideBoardLayout: "Sơ Đồ Bố Trí Bàn Cờ Lục Giác",
    guideSwipeNotice: "Vuốt ngang màn hình để xem toàn bộ bàn cờ",
    guideEnemyAbove: "HƯỚNG ĐỐI THỦ PHÍA TRÊN",
    guideStagePriority: "Tiến Trình Phát Triển Đội Hình",
    guideEarlyMidCarousel: "Đội hình đầu/giữa game & độ ưu tiên vòng đi chợ",
    guideCarouselPriority: "Ưu Tiên Vòng Đi Chợ",
    guidePlaystyleGuide: "Chỉ Dẫn Cách Vận Hành Chi Tiết",
    guideAuthor: "Tác Giả Bản Đóng Góp",

    createTitle: "Thiết Kế Sách Lược Chiến Thuật",
    createSub: "Tự do bố trí vị trí các tướng trên bàn cờ lục giác, định nghĩa các giai đoạn và chia sẻ ra cộng đồng.",
    createFormTitlePlaceholder: "Tên hướng dẫn đội hình (Ví dụ: Syndra Định Mệnh Gánh Kèo Siêu Cấp)",
    createPlaceholderPlaystyle: "Chỉ dẫn cách vận hành chi tiết (Ví dụ: Slowroll ở cấp 7 để kiếm Diana và Janna 3 sao)",
    createPlaceholderDescription: "Kinh nghiệm chuyên môn, trang bị trấn phái và mẹo xếp cờ khắc chế đối thủ...",
    createSelectDifficulty: "CHỌN ĐỘ KHÓ",
    createLabelDifficulty: "ĐỘ KHÓ VẬN HÀNH",
    createSelectTier: "CHỌN BẬC TIER",
    createLabelTier: "PHÂN KHÚC SỨC MẠNH",
    createCarryChampions: "TƯỚNG CHỦ LỰC (CARRY)",
    createTankChampions: "TƯỚNG CHỐNG CHỊU (TANK)",
    createAddUnitBtn: "Triển Khai Tướng Đã Chọn",
    createBoardHeading: "Sơ đồ bàn cờ lục giác tùy biến",
    createBoardSub: "Chọn tướng ở danh sách dưới, sau đó nhấp vào một ô lục giác trên bàn cờ để đặt.",
    createRegistryHeading: "Danh Sách Tướng Hiện Có",
    createRegistrySub: "Lọc và nhấp vào thẻ tướng để chọn hoặc sẵn sàng đưa lên bàn cờ mô phỏng.",
    createButtonSave: "Lưu & Công Bố Sách Lược",
    clearBtn: "Hủy",
    unitAnalystTitle: "BẢNG PHÂN TÍCH TƯỚNG",
    unitAnalystSub: "Nhấp chọn bất kỳ tướng nào để xem giá tiền, tộc hệ liên kết và chi tiết kỹ năng kích hoạt.",
    affiliatedTraits: "Tộc Hệ Liên Kết",

    hubTitle: "Trung Tâm Sáng Tạo Sách Lược",
    hubSub: "Theo dõi dữ liệu phân tích chỉ số người xem, lịch sử phân phối quỹ sáng tạo và đội hình cá nhân.",
    hubStatViews: "LƯỢT TRUY CẬP",
    hubStatUpvotes: "LƯỢT BÌNH CHỌN",
    hubStatShares: "LƯỢT CHIA SẺ TRUYỀN THÔNG",
    hubStatCopies: "SỐ LƯỢT SAO CHÉP ĐỘI HÌNH",
    hubGuidesTab: "ĐỘI HÌNH CỦA BẠN",
    hubAnalyticsTab: "THỐNG KÊ CHI TIẾT",
    hubRevenueTab: "QUỸ CHIA SẺ SÁNG TẠO",
    hubCreatedGuides: "Danh Sách Blueprints Bản Thân Thiết Kế",
    hubNoGuides: "Chưa có hướng dẫn đội hình nào",
    hubNoGuidesSub: "Hãy bắt đầu tạo đội hình đầu tiên để nhận dữ liệu thống kê từ người xem và nhận quỹ sáng tạo.",
    hubDraftActionDelete: "XÓA BỎ",
    hubDraftActionDuplicate: "NHÂN BẢN",
    hubLedgerTitle: "Nhật Ký Giao Dịch",
    hubLedgerSwipe: "Vuốt để xem toàn bộ trạng thái",

    profileRankDetails: "Xác Thực Thứ Hạng Đấu Trường",
    profileWinRate: "TỶ LỆ THẮNG",
    profileTop4Rate: "TỶ LỆ TOP 4",
    profileAvgPlacement: "HẠNG TRUNG BÌNH",
    profileGamesPlayed: "SỐ TRẬN ĐÃ ĐẤU",
    profileMatchHistory: "Lịch Sử Giao Tranh Gần Đây",
    profileSearchTitle: "Tra Cứu Dữ Liệu Anh Hùng ĐTCL",

    patchTitle: "Nhật Ký Thay Đổi Meta",
    patchReleaseDate: "HỆ THỐNG CẬP NHẬT BẢN CONVERGENCE • NGÀY HIỆU LỰC",
    patchItemImpact: "PHÂN TÍCH ẢNH HƯỞNG CHIẾN THUẬT",

    liveTrackerTitle: "Đồng Bộ Trực Tiếp Trận Đấu",
    liveTrackerSub: "Kết nối phân tích thời gian thực các đối thủ trong phòng đấu giúp đưa ra chiến thuật khắc chế.",
    liveLobbyRoster: "Danh Sách Người Chơi Trong Sảnh Đấu Trực Tiếp",
    liveHotStreak: "CHUỖI THẮNG",
    liveDangerLevel: "ĐỘ MỐI ĐE DỌA",
    livePredictedPlace: "HẠNG DỰ ĐOÁN"
  }
};
