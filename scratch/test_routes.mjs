async function test() {
  const urls = [
    'http://localhost:3000/khach-hang',
    'http://localhost:3000/khach-hang/Gm1wOOicHhxuNJMMLRAY',
    'http://localhost:3000/ho-so-du-an',
    'http://localhost:3000/nhan-su'
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`${url} -> ${res.status}`);
    } catch (e) {
      console.error(`${url} -> ERROR: ${e.message}`);
    }
  }
}
test();
