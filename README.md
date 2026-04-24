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

#### Thêm sự kiện + ảnh cho Sách và Timeline (đồng bộ)

Chỉnh sửa `src/i18n/en.js` và `src/i18n/vi.js` trong `book.events`.
Timeline sẽ tự đồng bộ theo cùng danh sách sự kiện này.

```javascript
book: {
  events: [
  {
    title: 'Tiêu đề sự kiện',
    date: '2024-06-15',
    description: 'Mô tả sự kiện của bạn',
    emoji: '💕',
    image: '/images/story/cover.jpg', // 1 ảnh
    // hoặc nhiều ảnh ở trang phải:
    images: ['/images/story/day-1.jpg', '/images/story/day-2.jpg']
  }
  ]
}
```

#### Lưu ảnh ở đâu (miễn phí)

- Cách dễ nhất: đặt ảnh vào thư mục `public/images/story/`.
- Dùng đường dẫn trong data như: `'/images/story/ten-anh.jpg'`.
- Khi deploy, ảnh sẽ đi kèm app và không tốn phí host riêng.
- Nếu muốn host ngoài miễn phí, có thể dùng [Cloudinary Free](https://cloudinary.com/) hoặc [Imgur](https://imgur.com/) rồi dán URL ảnh vào `image`/`images`.

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

3. Configure Cloudinary (for Gallery folder loading)
```bash
cp .env.example .env.local
```

Fill these in `.env.local` (server-side secrets, do not commit):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional frontend folder config:

- `VITE_CLOUDINARY_FOLDER_YES` (default: `the-yes`)
- `VITE_CLOUDINARY_FOLDER_FOREVER` (default: `forever`)

4. Start the development server
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

#### Add Events + Images for Book and Timeline (synced)

Edit `src/i18n/en.js` and `src/i18n/vi.js` under `book.events`.
The Timeline now auto-syncs from the same event list.

```javascript
book: {
  events: [
  {
    title: 'Your Event Title',
    date: '2024-06-15',
    description: 'Your event description',
    emoji: '💕',
    image: '/images/story/cover.jpg', // single image
    // or multiple images on right page:
    images: ['/images/story/day-1.jpg', '/images/story/day-2.jpg']
  }
  ]
}
```

#### Where to Store Images (Free)

- Easiest option: put files in `public/images/story/`.
- Reference them in data like: `'/images/story/your-photo.jpg'`.
- These files are bundled with your app deployment (no extra paid image host needed).
- If you prefer external free hosting, use [Cloudinary Free](https://cloudinary.com/) or [Imgur](https://imgur.com/) and paste the image URL into `image`/`images`.

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