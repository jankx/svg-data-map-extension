/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SVGMapConfig } from '../types';

export const VIETNAM_MAP_PRESET: SVGMapConfig = {
  title: 'Bản đồ Du lịch Việt Nam',
  description: 'Khám phá các địa điểm du lịch, ẩm thực, khách sạn và dịch vụ vận chuyển dọc dải đất hình chữ S.',
  svgContent: `<svg viewBox="0 0 600 810" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background-color: #f0f7fc;">
  <!-- Background Ocean Grid Pattern -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e1effa" stroke-width="1" />
    </pattern>
    <radialGradient id="gradient-ocean" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f4faf1" />
      <stop offset="100%" stop-color="#e2effa" />
    </radialGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#grid)" />
  <rect width="100%" height="100%" fill="url(#gradient-ocean)" opacity="0.6" />

  <!-- Sea lines and labeling -->
  <text x="440" y="320" font-family="'Inter', sans-serif" font-size="12" fill="#a2b9cc" font-weight="600" letter-spacing="3" opacity="0.8">BIỂN ĐÔNG</text>
  <text x="80" y="480" font-family="'Inter', sans-serif" font-size="10" fill="#a2b9cc" font-weight="500" letter-spacing="1" opacity="0.6" transform="rotate(-30 80 480)">Vịnh Thái Lan</text>
  <text x="240" y="100" font-family="'Inter', sans-serif" font-size="10" fill="#a2b9cc" font-weight="500" letter-spacing="1" opacity="0.6" transform="rotate(10 240 100)">Vịnh Bắc Bộ</text>

  <!-- MAP COMPOSITIONS: Neighboring landmasses for realism (unclickable) -->
  <path d="M 0 0 L 130 0 L 120 70 L 60 120 L 0 160 Z" fill="#e4ebf0" stroke="#d5dee6" stroke-width="1" />
  <path d="M 0 160 L 60 120 L 100 130 L 130 180 L 150 250 L 110 320 L 70 340 L 40 400 L 60 480 L 0 520 Z" fill="#e4ebf0" stroke="#d5dee6" stroke-width="1" />
  <path d="M 60 480 L 120 480 L 140 520 L 150 580 L 120 630 L 60 630 L 0 600 Z" fill="#e4ebf0" stroke="#d5dee6" stroke-width="1" />

  <!-- Vietnam Mainland Regions -->
  <g id="vietnam-regions" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" cursor="pointer">
    
    <!-- 1. Vùng Bắc Bộ (Hanoi, Sapa, Ha Long) -->
    <path id="region-north" d="M 120 70 L 170 50 L 220 55 L 260 90 L 280 130 L 240 185 L 205 185 L 185 160 L 145 130 L 110 125 Z" 
          fill="#319795" opacity="0.85" />

    <!-- 2. Vùng Bắc Trung Bộ (Thanh Hoa, Vinh, Hue) -->
    <path id="region-north-central" d="M 205 185 L 240 185 L 260 210 L 250 245 L 285 285 L 320 325 L 340 330 L 310 345 L 265 305 L 235 255 L 195 215 Z" 
          fill="#2b6cb0" opacity="0.85" />

    <!-- 3. Vùng Nam Trung Bộ / Đà Nẵng (Da Nang, Hoi An, Nha Trang, Binh Thuan) -->
    <path id="region-south-central" d="M 340 330 L 355 332 L 365 365 L 385 410 L 410 450 L 415 500 L 400 525 L 375 520 L 365 470 L 345 425 L 325 365 Z" 
          fill="#1d72b8" opacity="0.85" />

    <!-- 4. Vùng Tây Nguyên (Da Lat, Pleiku, Buon Ma Thuot) -->
    <path id="region-highlands" d="M 325 365 L 345 425 L 365 470 L 375 520 L 355 540 L 320 545 L 310 480 L 315 410 Z" 
          fill="#dd6b20" opacity="0.85" />

    <!-- 5. Vùng Đông Nam Bộ (TP.HCM, Vung Tau, Dong Nai) -->
    <path id="region-southeast" d="M 320 545 L 355 540 L 350 575 L 325 615 L 295 640 L 265 625 L 280 575 L 305 570 Z" 
          fill="#4c51bf" opacity="0.85" />

    <!-- 6. Vùng Đồng bằng Sông Cửu Long (Can Tho, Ca Mau, Phu Quoc) -->
    <path id="region-mekong" d="M 265 625 L 295 640 L 285 660 L 290 690 L 250 725 L 195 725 L 190 695 L 225 650 Z" 
          fill="#38a169" opacity="0.85" />

    <!-- Phu Quoc Island -->
    <path id="island-phuquoc" d="M 148 700 A 12 18 0 1 1 162 725 Z" 
          fill="#38a169" opacity="0.85" />

    <!-- Con Dao Island -->
    <circle id="island-condao" cx="310" cy="735" r="7" 
            fill="#4c51bf" opacity="0.85" />

    <!-- 7. Quần đảo Hoàng Sa (Hoàng Sa District under Da Nang) -->
    <g id="region-hoangsa" fill="#e53e3e" stroke="#ffffff" stroke-width="1.5">
      <circle cx="430" cy="340" r="4" />
      <circle cx="445" cy="342" r="3" />
      <circle cx="438" cy="355" r="5" />
      <circle cx="452" cy="358" r="3" />
      <circle cx="460" cy="348" r="4" />
      <!-- Label indicator -->
      <path d="M 430 340 L 460 348" stroke="#ffffff" stroke-width="0.5" opacity="0.6" />
    </g>

    <!-- 8. Quần đảo Trường Sa (Trường Sa District under Khanh Hoa) -->
    <g id="region-truongsa" fill="#e53e3e" stroke="#ffffff" stroke-width="1.5">
      <circle cx="480" cy="610" r="3" />
      <circle cx="493" cy="625" r="4" />
      <circle cx="475" cy="635" r="3" />
      <circle cx="505" cy="640" r="5" />
      <circle cx="522" cy="630" r="3" />
      <circle cx="510" cy="655" r="4" />
      <circle cx="535" cy="660" r="3" />
      <circle cx="495" cy="670" r="4" />
      <circle cx="515" cy="680" r="3" />
    </g>
  </g>

  <!-- Aesthetic ocean grid borders and boundary text -->
  <line x1="120" y1="0" x2="120" y2="70" stroke="#cfdfeb" stroke-dasharray="4,4" />
  <line x1="0" y1="160" x2="60" y2="160" stroke="#cfdfeb" stroke-dasharray="4,4" />
  <line x1="0" y1="480" x2="60" y2="480" stroke="#cfdfeb" stroke-dasharray="4,4" />

  <!-- Label tags printed nicely onto layout -->
  <g opacity="0.85" style="pointer-events: none;">
    <text x="175" y="115" font-family="'Inter', sans-serif" font-size="11" fill="#ffffff" font-weight="700">HÀ NỘI</text>
    <text x="250" y="240" font-family="'Inter', sans-serif" font-size="11" fill="#ffffff" font-weight="700">HUẾ</text>
    <text x="315" y="380" font-family="'Inter', sans-serif" font-size="11" fill="#ffffff" font-weight="700">ĐÀ NẴNG</text>
    <text x="320" y="475" font-family="'Inter', sans-serif" font-size="11" fill="#ffffff" font-weight="700">TÂY NGUYÊN</text>
    <text x="300" y="580" font-family="'Inter', sans-serif" font-size="11" fill="#ffffff" font-weight="700">TP. Hồ Chí Minh</text>
    <text x="215" y="685" font-family="'Inter', sans-serif" font-size="11" fill="#ffffff" font-weight="700">CẦN THƠ</text>
    <text x="410" y="325" font-family="'Inter', sans-serif" font-size="9" fill="#1e3a8a" font-weight="700">Qđ. Hoàng Sa</text>
    <text x="450" y="595" font-family="'Inter', sans-serif" font-size="9" fill="#1e3a8a" font-weight="700">Qđ. Trường Sa</text>
  </g>
</svg>`,
  regions: [
    {
      id: 'vn-scc',
      name: 'Đà Nẵng & Hội An',
      pathIds: ['region-south-central', 'region-hoangsa'],
      fillColor: '#1d72b8',
      marker: {
        id: 'marker-danang',
        x: 58,
        y: 43,
        iconType: 'hotel',
        label: 'Đà Nẵng'
      },
      description: 'Trung tâm kinh tế, du lịch miền Trung với các bãi biển trứ danh, di sản thế giới Hội An cổ kính và thành phố trực thuộc trung ương Đà Nẵng năng động.',
      items: [
        {
          id: 'item-danang-1',
          title: 'Thương cảng Hội An',
          description: 'Nằm dọc theo dải bờ biển miền Trung, khu vực Huế - Đà Nẵng không chỉ nổi tiếng với cảnh quan thiên nhiên hùng vĩ mà còn là nơi giao thoa của các tuyến hàng hải quan trọng trong lịch sử. Từ thương cảng cổ, dấu tích tàu thuyền cho đến các hiện vật khảo cổ dưới nước, mỗi địa điểm đều phản ánh một phần câu chuyện về giao thương, văn hóa và sự phát triển của các nền văn minh ven biển. Ngày nay, hành trình khám phá khu vực này mở ra góc nhìn đa chiều - nơi du khách có thể kết nối di sản vật thể với những lớp trầm tích lịch sử ẩn sâu dưới lòng đại dương, tạo nên một trải nghiệm vừa trực quan vừa giàu giá trị học thuật.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://hoian.gov.vn'
        },
        {
          id: 'item-danang-2',
          title: 'Chùa Cầu Hội An',
          description: 'Công trình kiến trúc độc bản bằng gỗ bắc qua con lạch nhỏ, giao thoa tinh hoa Nhật Bản, Hoa Kỳ cổ xưa và Việt Nam truyền thống. Chùa Cầu là biểu tượng lịch sử vô giá hơn 400 năm tuổi của phố cổ Hội An, chứng kiến bao thăng trầm thời đại.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://vi.wikipedia.org/wiki/Chùa_Cầu'
        },
        {
          id: 'item-danang-3',
          title: 'Bãi Biển Mỹ Khê',
          description: 'Được vinh danh là một trong sáu bãi biển quyến rũ nhất hành tinh bởi tạp chí Forbes Mỹ, sở hữu cát trắng mịn, độ dốc thoai thoải, dòng nước ấm quanh năm lý tưởng cho các hoạt động thể thao lướt ván và nghỉ dưỡng cao cấp.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://danang.gov.vn'
        }
      ]
    },
    {
      id: 'vn-north',
      name: 'Bắc Bộ & Thủ Đô',
      pathIds: ['region-north'],
      fillColor: '#319795',
      marker: {
        id: 'marker-hanoi',
        x: 34,
        y: 15,
        iconType: 'scenic',
        label: 'Hồ Gươm'
      },
      description: 'Vùng đất ngàn năm văn hiến Bắc Bộ với các trung tâm di sản lớn bao gồm Hà Nội cổ kính, vịnh Hạ Long kỳ vĩ và rẻo cao Sa Pa thơ mộng mù sương.',
      items: [
        {
          id: 'item-north-1',
          title: 'Hồ Hoàn Kiếm & Phố Cổ',
          description: 'Trái tim của thủ đô Hà Nội với rùa vàng truyền thuyết, Tháp Rùa cổ kính rêu phong và 36 phố phường nhộn nhịp mua bán lưu giữ ngành nghề thủ công trăm năm lịch sử.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://hanoi.gov.vn'
        },
        {
          id: 'item-north-2',
          title: 'Vịnh Hạ Long',
          description: 'Kỳ quan thiên nhiên thế giới độc đáo với hàng ngàn đảo đá vôi khổng lồ mọc lên từ làn nước xanh ngọc lục bảo tinh khiết, điểm đến nhất định phải ghé qua một lần trong đời.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://halong.gov.vn'
        }
      ]
    },
    {
      id: 'vn-north-central',
      name: 'Cố đô Huế',
      pathIds: ['region-north-central'],
      fillColor: '#2b6cb0',
      marker: {
        id: 'marker-hue',
        x: 43,
        y: 31,
        iconType: 'transport',
        label: 'Kinh Thành Huế'
      },
      description: 'Dải đất hẹp miền Trung nắng gió, nơi tọa lạc của quần thể di tích Cố đô Huế linh thiêng, nhã nhạc cung đình và dòng sông Hương thơ mộng trữ tình.',
      items: [
        {
          id: 'item-hue-1',
          title: 'Đại Nội Huế',
          description: 'Kinh thành của triều đại phong kiến nhà Nguyễn cuối cùng của Việt Nam, chứa đựng các đền đài nguy nga tráng lệ, lăng tẩm uy nghiêm rêu phong cổ kính dọc dòng sông Hương mềm mại.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://hueworldheritage.org.vn'
        }
      ]
    },
    {
      id: 'vn-highlands',
      name: 'Tây Nguyên & Đà Lạt',
      pathIds: ['region-highlands'],
      fillColor: '#dd6b20',
      marker: {
        id: 'marker-dalat',
        x: 58,
        y: 58,
        iconType: 'food',
        label: 'Đà Lạt'
      },
      description: 'Vùng cao nguyên đất đỏ bazan bazơ trù phú, cái nôi của văn hóa cồng chiêng độc đáo vang mây ngàn và thành phố ngàn hoa Đà Lạt ôn đới quanh năm mát mẻ sương mờ.',
      items: [
        {
          id: 'item-dalat-1',
          title: 'Hồ Xuân Hương & Chợ Đà Lạt',
          description: 'Trái tim thơ mộng của thành phố sương mù, nơi du khách thỏa thích thưởng thức ly sữa đậu nành nóng hổi, thịt xiên nướng lề đường thơm lừng giữa không khí se lạnh Tây Nguyên bản địa.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://lamdong.gov.vn'
        }
      ]
    },
    {
      id: 'vn-southeast',
      name: 'TP. Hồ Chí Minh',
      pathIds: ['region-southeast', 'island-condao'],
      fillColor: '#4c51bf',
      marker: {
        id: 'marker-tphcm',
        x: 48,
        y: 72,
        iconType: 'transport',
        label: 'Sài Gòn'
      },
      description: 'Thành phố mang tên Bác náo nhiệt năng động cả ngày lẫn đêm, đầu tàu kinh tế cả nước hòa quyện giữa phong vị Hoa Kỳ - Pháp xưa và nét trẻ trung thời thượng hiện đại.',
      items: [
        {
          id: 'item-tphcm-1',
          title: 'Dinh Độc Lập',
          description: 'Chứng nhân lịch sử vĩ đại đánh dấu ngày thống nhất đất nước 30/04/1975, công trình kiến trúc kết hợp phong thủy phương Đông tinh tế và đường nét hiện đại phóng khoáng.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://dinhdoclap.gov.vn'
        }
      ]
    },
    {
      id: 'vn-mekong',
      name: 'Đồng Bằng Sông Cửu Long',
      pathIds: ['region-mekong', 'island-phuquoc'],
      fillColor: '#38a169',
      marker: {
        id: 'marker-phuquoc',
        x: 24,
        y: 86,
        iconType: 'scenic',
        label: 'Phú Quốc'
      },
      description: 'Miền Tây sông nước mộc mạc trù phú tốt tươi, đặc sản lúa gạo, các miệt vườn trái cây ăn trái ngào ngạt, chợ nổi nhộn nhịp bình minh và đảo ngọc Phú Quốc nghỉ dưỡng hoang sơ.',
      items: [
        {
          id: 'item-mekong-1',
          title: 'Đảo Ngọc Phú Quốc',
          description: 'Hòn đảo lớn nhất Việt Nam sở hữu Bãi Sao bãi cát trắng mịn màng như kem, rạn san hô lặn biển đa sắc rực rỡ dưới nắng và đặc sản nước mắm cá cơm hảo hạng thơm danh quốc tế.',
          linkLabel: 'Xem chi tiết',
          linkUrl: 'https://phuquoc.kiengiang.gov.vn'
        }
      ]
    }
  ],
  settings: {
    defaultFillColor: '#e2edf5',
    hoverFillColor: '#93c5fd',
    selectedFillColor: '#3b82f6',
    markerColor: '#f97316',
    backgroundColor: '#ffffff'
  }
};

export const EXHIBITION_MAP_PRESET: SVGMapConfig = {
  title: 'Sơ đồ Vùng Triển Lãm Công Nghệ (Bento Layout)',
  description: 'Sơ đồ định tuyến các phòng triển lãm, khu vực bento, sân khấu chính và các gian hàng giới thiệu giải pháp AI.',
  svgContent: `<svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background-color: #fafafa;">
  <defs>
    <pattern id="grid-ex" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1.5" fill="#e5e5e5" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid-ex)" />

  <!-- Main Stage Background Layout -->
  <rect x="20" y="20" width="560" height="360" rx="12" fill="none" stroke="#e4e4e7" stroke-width="2" />
  
  <g id="exhibition-zones" cursor="pointer" stroke="#ffffff" stroke-width="2">
    <!-- Khu vực 1: Sân khấu AI -->
    <rect id="zone-stage" x="40" y="40" width="220" height="140" rx="8" fill="#ec4899" opacity="0.85" />
    
    <!-- Khu vực 2: Demo Room A -->
    <rect id="zone-demo-a" x="280" y="40" width="130" height="140" rx="8" fill="#6366f1" opacity="0.85" />
    
    <!-- Khu vực 3: Demo Room B -->
    <rect id="zone-demo-b" x="430" y="40" width="130" height="140" rx="8" fill="#14b8a6" opacity="0.85" />
    
    <!-- Khu vực 4: Tech Hub Trung Tâm -->
    <rect id="zone-hub" x="40" y="200" width="370" height="160" rx="8" fill="#3b82f6" opacity="0.85" />
    
    <!-- Khu vực 5: Food & Networking Cafe -->
    <rect id="zone-cafe" x="430" y="200" width="130" height="160" rx="8" fill="#f59e0b" opacity="0.85" />
  </g>

  <!-- Labels on layouts -->
  <g opacity="0.9" style="pointer-events: none;">
    <text x="110" y="100" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">SÂN KHẤU CHÍNH AI</text>
    <text x="110" y="120" font-family="'Inter', sans-serif" font-size="9" fill="#fce7f3" text-anchor="middle">Keynote Speakers & Product Launch</text>

    <text x="345" y="100" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">PHÒNG DEMO A</text>
    <text x="345" y="120" font-family="'Inter', sans-serif" font-size="9" fill="#e0e7ff" text-anchor="middle">Smart Retail Tech</text>

    <text x="495" y="100" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">PHÒNG DEMO B</text>
    <text x="495" y="120" font-family="'Inter', sans-serif" font-size="9" fill="#ccfbf1" text-anchor="middle">Robotics Lab</text>

    <text x="225" y="270" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">TRUNG TÂM TECH HUB AI</text>
    <text x="225" y="295" font-family="'Inter', sans-serif" font-size="10" fill="#dbeafe" text-anchor="middle">Các gian hàng Start-ups, Developers & Mini-games</text>

    <text x="495" y="270" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">QUẦY CAFE</text>
    <text x="495" y="290" font-family="'Inter', sans-serif" font-size="9" fill="#fef3c7" text-anchor="middle">Networking & Trụ sở F&B</text>
  </g>
</svg>`,
  regions: [
    {
      id: 'ex-stage',
      name: 'Sân Khấu Chính AI (Main Stage)',
      pathIds: ['zone-stage'],
      fillColor: '#ec4899',
      marker: {
        id: 'stage-pin',
        x: 25,
        y: 20,
        iconType: 'scenic',
        label: 'Main Stage'
      },
      description: 'Nơi diễn ra các buổi thuyết trình đổi mấu công nghệ, vinh danh start-up, giới thiệu giải pháp AI thế hệ mới từ Google Cloud và các đối tác.',
      items: [
        {
          id: 'ex-item-1',
          title: 'Khai mạc & Keynote AI',
          description: 'Hàng loạt sản phẩm ứng dụng đột phá sử dụng Gemini 2.0 và các mô hình tác nhân agent tự động thế hệ mới sẽ được trình diễn trực quan.',
          linkLabel: 'Xem Lịch Chi Tiết',
          linkUrl: 'https://google.com'
        },
        {
          id: 'ex-item-2',
          title: 'Panel Discussion: Tương Lai GenAI',
          description: 'Cuộc đối thoại nảy lửa giữa các kỹ sư hàng đầu về công nghệ đa phương thức (modalities) và cách tối ưu hóa chi phí vận hành mô hình lớn.',
          linkLabel: 'Đăng ký phòng họp',
          linkUrl: 'https://google.com'
        }
      ]
    },
    {
      id: 'ex-hub',
      name: 'Trung Tâm Tech Hub AI',
      pathIds: ['zone-hub'],
      fillColor: '#3b82f6',
      marker: {
        id: 'hub-pin',
        x: 35,
        y: 65,
        iconType: 'transport',
        label: 'Developer Area'
      },
      description: 'Không gian lý tưởng để giao lưu, bàn bạc ý tưởng lập trình, trao đổi chuyên môn, trải nghiệm Coding Bootcamp cùng chuyên gia công nghệ.',
      items: [
        {
          id: 'ex-item-3',
          title: 'Quầy Trải Nghiệm AI Studio Builder',
          description: 'Khách tham quan được trực tiếp dùng các công cụ tự sinh (No-code / Low-code) để sinh ứng dụng web đầy đủ tính năng trong vòng 5 phút!',
          linkLabel: 'Trải nghiệm ngay'
        }
      ]
    },
    {
      id: 'ex-demo-a',
      name: 'Phòng Demo A (Smart Retail)',
      pathIds: ['zone-demo-a'],
      fillColor: '#6366f1',
      marker: {
        id: 'demo-a-pin',
        x: 58,
        y: 22,
        iconType: 'hotel',
        label: 'Booth Retail'
      },
      description: 'Mô hình siêu thị thông minh tích hợp camera AI, thanh toán tự động không xếp hàng và tư vấn viên ảo thấu hiểu hành vi khách hàng.',
      items: [
        {
          id: 'ex-item-4',
          title: 'Giải pháp Smart Shelf',
          description: 'Kệ hàng tự động phát hiện hết hàng và cảnh báo kho vận thông qua mô hình phân tích ảnh chụp thực tế theo thời gian thực.'
        }
      ]
    }
  ],
  settings: {
    defaultFillColor: '#f4f4f5',
    hoverFillColor: '#e4e4e7',
    selectedFillColor: '#3b82f6',
    markerColor: '#ef4444',
    backgroundColor: '#fafafa'
  }
};
