/* =============================================================
   💖 ĐÂY LÀ FILE DUY NHẤT BẠN CẦN SỬA 💖
   Thay tên, lời nhắn, lý do yêu, và đường dẫn ảnh ở đây.
   Tất cả phần còn lại tự động cập nhật theo.
   ============================================================= */

const CONFIG = {
  // --- Tên vợ yêu (hiện ở khắp trang) ---
  herName: "Em Yêu",

  // --- Màn hình mở đầu (Hero) ---
  hero: {
    eyebrow: "Gửi người anh thương nhất",
    title: "Em là cả vũ trụ của anh",
    subtitle:
      "Giữa hàng tỉ vì sao, anh may mắn được lạc vào quỹ đạo của em.",
    scrollHint: "Cuộn xuống để đi cùng anh nhé ↓",
  },

  // --- Câu mở section "Vì sao anh yêu em" ---
  reasonsTitle: "Vì sao anh yêu em",
  reasonsIntro:
    "Có hàng nghìn lý do, nhưng đây là vài ngôi sao sáng nhất trong vũ trụ của riêng mình.",

  // Mỗi lý do là 1 thẻ nổi. Thêm/bớt thoải mái.
  reasons: [
    {
      icon: "✦",
      title: "Nụ cười của em",
      text: "Chỉ cần em cười, mọi muộn phiền trong anh đều tan biến như sao băng.",
    },
    {
      icon: "♥",
      title: "Sự dịu dàng",
      text: "Em làm cho cả những ngày bình thường nhất cũng trở nên ấm áp.",
    },
    {
      icon: "✷",
      title: "Cách em yêu anh",
      text: "Em yêu anh theo cách khiến anh muốn trở thành phiên bản tốt hơn mỗi ngày.",
    },
    {
      icon: "✺",
      title: "Là nhà của anh",
      text: "Dù thế giới có rộng lớn đến đâu, bên em vẫn là nơi anh muốn về.",
    },
  ],

  // --- Thư viện ảnh (thay đường dẫn ảnh thật của bạn vào đây) ---
  galleryTitle: "Những khoảnh khắc của mình",
  galleryIntro:
    "Mỗi tấm ảnh là một vì sao trong bầu trời kỷ niệm của chúng ta.",
  // Bỏ ảnh thật vào thư mục assets/ rồi đổi src: "assets/ten-anh.jpg"
  // Để trống src ("") sẽ hiện khung placeholder đẹp.
  gallery: [
    { src: "", caption: "Lần đầu gặp em ✨" },
    { src: "", caption: "Chuyến đi đầu tiên 🌙" },
    { src: "", caption: "Ngày mình bên nhau 💫" },
    { src: "", caption: "Và mãi về sau... ♾️" },
  ],

  // --- Lá thư tình ---
  letterTitle: "Lá thư cho em",
  letter: [
    "Gửi em yêu của anh,",
    "Anh không giỏi nói lời hoa mỹ, nên anh mượn cả một vũ trụ để nói thay anh: em quý giá với anh hơn tất cả những vì sao kia cộng lại.",
    "Cảm ơn em đã xuất hiện, đã ở lại, và đã chọn anh mỗi ngày. Anh hứa sẽ luôn là người nắm tay em đi qua mọi dải ngân hà của cuộc đời này.",
  ],
  signature: "Mãi mãi yêu em,",
  signatureName: "Anh",

  // --- Nhạc nền (tùy chọn) ---
  // Bỏ file nhạc vào assets/ rồi đổi thành "assets/song.mp3".
  // Để trống ("") sẽ ẩn nút nhạc.
  musicSrc: "",
};

// Expose to other scripts (top-level `const` is not attached to window).
window.CONFIG = CONFIG;
