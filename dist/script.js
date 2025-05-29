const messages = [
  "継続は力なり。今日の努力が未来を作る。",
  "できるまでやる。やめたらそこで試合終了。",
  "失敗は成功のもと。恐れず挑戦しよう。",
  "一歩ずつでも前に進むことが大事。",
  "勉強は自分への最高の投資。",
  "努力は裏切らない。信じて続けよう。",
  "小さな積み重ねが大きな成果を生む。",
  "今の頑張りが明日の自信になる。",
  "夢は見るものじゃない。叶えるものだ。",
  "やればできる。あとはやるかやらないか。",
  "諦めたらそこで試合終了。最後まで走り切ろう。",
  "知識は力。今日もたくさん吸収しよう！"
];

const messageEl = document.getElementById('message');
const btn = document.getElementById('generateBtn');

btn.addEventListener('click', () => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  messageEl.textContent = messages[randomIndex];
});
