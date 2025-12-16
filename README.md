# تحريرها (HerLiberation)

## 🌸 About the Project

**تحريرها** is a powerful awareness campaign website highlighting the critical issue of child marriage in Iraq. The platform provides an interactive experience to educate visitors about children's rights and the dangers of early marriage.

### Campaign Slogan
**قبل الـ18 عامًا: طفلة لا زوجة**  
*Under 18: A Child, Not a Wife*

---

## 📁 Project Structure

```
HerLiberation/
├── assets/
│   └── images/              # Image assets
│       ├── 1_20251127_202518.png
│       ├── Logos Placement.png
│       └── visual-insight.png
├── css/
│   └── styles.css           # Main stylesheet
├── database/
│   ├── articles.json        # Blog articles data
│   ├── comments.json        # User comments data
│   └── stats.json           # Site statistics
├── js/
│   └── script.js            # Main JavaScript logic
├── node_modules/            # Node.js dependencies
├── .venv/                   # Python virtual environment
├── admin.html               # Admin dashboard
├── index.html               # Main entry point
├── server.js                # Express backend server
├── package.json             # Node.js configuration
├── package-lock.json        # Dependency lock file
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   cd HerLiberation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 🎯 Features

### Main Website (`index.html`)
- **Interactive Age Slider**: Explore children's rights at different ages (9-18)
- **Statistical Dashboard**: View shocking statistics about child marriage in Iraq
- **Provincial Map**: Explore child marriage rates across Iraqi provinces
- **Blog Section**: Read articles about child rights and protection
- **Comments System**: Share opinions and experiences
- **Social Sharing**: Share the campaign on X (Twitter), WhatsApp, and more
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Animated Particles**: Beautiful background effects

### Admin Panel (`admin.html`)
- **Secure Login**: Password-protected admin access
- **Article Management**: Create, view, and delete blog articles
- **Statistics Dashboard**: Monitor site views, likes, and engagement
- **Real-time Updates**: Changes reflect immediately on the main site

**Admin Credentials:**
- Password: `TahrirAdmin@2025`

---

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients, animations, and glassmorphism
- **JavaScript (ES6+)**: Interactive features and API integration
- **Google Fonts**: Tajawal font family for Arabic text

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web server framework
- **CORS**: Cross-origin resource sharing
- **JSON File Storage**: Simple database using JSON files

---

## 📊 API Endpoints

### Statistics
- `GET /api/stats` - Get site statistics (views, likes)
- `POST /api/stats/view` - Increment view count
- `POST /api/stats/like` - Toggle like status

### Articles
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create new article
- `DELETE /api/articles/:id` - Delete article by ID

### Comments
- `GET /api/comments` - Get all comments
- `POST /api/comments` - Add new comment

---

## 🎨 Design Features

- **RTL Support**: Full right-to-left layout for Arabic content
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Glassmorphism**: Modern glass-effect cards
- **Gradient Accents**: Pink to purple gradient theme
- **Smooth Animations**: Micro-interactions and transitions
- **Accessibility**: Semantic HTML and ARIA labels

---

## 📝 Development

### File Organization
- **CSS**: All styles in `css/styles.css`
- **JavaScript**: Main logic in `js/script.js`
- **Images**: All images in `assets/images/`
- **Data**: JSON databases in `database/`

### Adding New Features
1. Edit `index.html` for structure
2. Update `css/styles.css` for styling
3. Modify `js/script.js` for functionality
4. Update `server.js` for backend logic

---

## 🌐 Social Media

Follow the campaign on:
- **Facebook**: [HerLiberation](https://www.facebook.com/profile.php?id=61584357966361)
- **X (Twitter)**: [@Herliberation1](https://x.com/Herliberation1)
- **Instagram**: [@herliberation1](https://www.instagram.com/herliberation1/)
- **Threads**: [@herliberation1](https://www.threads.com/@herliberation1)
- **TikTok**: [@herliberation1](https://www.tiktok.com/@herliberation1)

---

## 📄 License

This project is created for social awareness purposes.

---

## 🤝 Contributing

This is a campaign website focused on raising awareness about child marriage in Iraq. If you'd like to contribute or support the cause, please reach out through our social media channels.

---

## 💡 Support

For technical support or inquiries, please contact through the social media channels listed above.

---

**Made with ❤️ for a better future**
