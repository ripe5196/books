# 💕 Wedding Journey Web UI

> 🇻🇳 [Tiếng Việt](#tiếng-việt) | 🇬🇧 [English](#english)

---

## Tiếng Việt

Ứng dụng web xinh đẹp để chia sẻ hành trình đám cưới của bạn với bạn bè và gia đình.

### Tính năng

- **📖 Sách kỷ niệm**: Lật từng trang như cuốn sách thực sự để xem lại các khoảnh khắc quan trọng
- **📅 Dòng thời gian**: Hiển thị các cột mốc quan trọng trong hành trình tình yêu
- **🖼️ Thư viện ảnh**: Chia sẻ ảnh từ lễ đính hôn, đám cưới và tuần trăng mật
- **💌 Tin nhắn bí mật**: Ẩn một thông điệp ngọt ngào dành riêng cho người thân yêu
- **Thiết kế responsive**: Hiển thị đẹp trên máy tính, máy tính bảng và điện thoại
- **Giao diện tương tác**: Hiệu ứng chuyển trang 3D mượt mà và sinh động

### Công nghệ sử dụng

- **React** - Thư viện giao diện người dùng
- **Vite** - Công cụ build và máy chủ phát triển
- **CSS3** - Tạo kiểu hiện đại với hiệu ứng động

### Bắt đầu

#### Yêu cầu

- Node.js 16+
- npm hoặc yarn

#### Cài đặt

1. Clone repository
```bash
git clone https://github.com/ripe5196/books.git
cd books
```

2. Cài đặt các gói phụ thuộc
```bash
npm install
```

3. Khởi chạy máy chủ phát triển
```bash
npm run dev
```

Ứng dụng sẽ mở tại `http://localhost:5173`

#### Build cho môi trường Production

```bash
npm run build
```

Tạo ra bản build tối ưu trong thư mục `dist`.

### Cấu trúc dự án

```
src/
├── components/
│   ├── Book.jsx            - Thành phần sách lật trang 3D
│   ├── Timeline.jsx        - Dòng thời gian các sự kiện
│   ├── Gallery.jsx         - Thư viện ảnh với chế độ xem modal
│   └── HiddenMessage.jsx   - Thông điệp bí mật
├── data/
│   └── photos.js           - Dữ liệu ảnh cho thư viện
├── styles/
│   ├── Book.css            - Kiểu dáng sách
│   ├── Timeline.css        - Kiểu dáng dòng thời gian
│   ├── Gallery.css         - Kiểu dáng thư viện ảnh
│   └── HiddenMessage.css   - Kiểu dáng thông điệp bí mật
├── App.jsx                 - Thành phần ứng dụng chính
├── App.css                 - Kiểu dáng ứng dụng
├── index.css               - Kiểu dáng toàn cục
└── main.jsx                - Điểm vào ứng dụng
```

### Tùy chỉnh

#### Thêm sự kiện vào Sách kỷ niệm

Chỉnh sửa `src/components/Book.jsx` và thay đổi mảng `weddingEvents`:

```javascript
const weddingEvents = [
  {
    id: 1,
    title: 'Tiêu đề sự kiện',
    date: 'Ngày tháng năm',
    description: 'Mô tả sự kiện của bạn',
    emoji: '💕',
    image: 'đường-dẫn-ảnh'
  },
  // Thêm sự kiện khác...
]
```

#### Thêm ảnh vào Thư viện

Chỉnh sửa `src/data/photos.js` để thêm ảnh mới.

#### Thay đổi thông điệp bí mật

Chỉnh sửa `src/components/HiddenMessage.jsx` và thay đổi mảng `messages`:

```javascript
const messages = [
  "Thông điệp yêu thương của bạn 💕",
  // Thêm thông điệp khác...
]
```

---

## English

A beautiful web application to share your wedding journey with friends and family.

### Features

- **📖 Memory Book**: Flip through pages like a real book to relive precious moments
- **📅 Timeline**: Display your relationship milestones and important events
- **🖼️ Gallery**: Share photos from your engagement, wedding, and honeymoon
- **💌 Hidden Message**: Hide a sweet message for your loved one
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Interactive UI**: Smooth 3D page-flip animations and hover effects

### Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with animations

### Getting Started

#### Prerequisites

- Node.js 16+
- npm or yarn

#### Installation

1. Clone the repository
```bash
git clone https://github.com/ripe5196/books.git
cd books
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

#### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Project Structure

```
src/
├── components/
│   ├── Book.jsx            - 3D page-flip book component
│   ├── Timeline.jsx        - Timeline of events
│   ├── Gallery.jsx         - Photo gallery with modal view
│   └── HiddenMessage.jsx   - Hidden love message popup
├── data/
│   └── photos.js           - Photo data for the gallery
├── styles/
│   ├── Book.css            - Book styling
│   ├── Timeline.css        - Timeline styling
│   ├── Gallery.css         - Gallery styling
│   └── HiddenMessage.css   - Hidden message styling
├── App.jsx                 - Main app component
├── App.css                 - App styling
├── index.css               - Global styles
└── main.jsx                - App entry point
```

### Customization

#### Adding Events to the Memory Book

Edit `src/components/Book.jsx` and modify the `weddingEvents` array:

```javascript
const weddingEvents = [
  {
    id: 1,
    title: 'Your Event Title',
    date: 'Month DD, YYYY',
    description: 'Your event description',
    emoji: '💕',
    image: 'your-image-url'
  },
  // Add more events...
]
```

#### Adding Photos to the Gallery

Edit `src/data/photos.js` to add new photos.

#### Changing the Hidden Message

Edit `src/components/HiddenMessage.jsx` and modify the `messages` array:

```javascript
const messages = [
  "Your love message here 💕",
  // Add more messages...
]
```

### Colors & Theming

To customize colors, edit:
- `src/index.css` - Global background gradient
- `src/App.css` - Header and tab styling
- `src/styles/Book.css` - Book colors
- `src/styles/Timeline.css` - Timeline colors
- `src/styles/Gallery.css` - Gallery colors

## License

This project is open source and available under the MIT License.

## Made with ❤️

Perfect for sharing your special day with loved ones! 💕