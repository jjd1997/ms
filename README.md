# 林澈个人面试博客主页

这是一个 React + Vite + TypeScript 的个人面试博客页面，使用 GSAP ScrollTrigger 做滚动视差动画，并用 PixiJS 做局部视觉特效。

## 本地查看

```bash
npm install
npm run dev
```

默认地址是 `http://127.0.0.1:5173/`。

## 内容定制

页面展示内容集中在 `src/content/site-content.json`。

标准 JSON 不支持注释。如果需要写字段说明，看 `src/content/README.md`。

当前内容模型先按单人站点设计。未来如果需要多人复用，可以拆成多个个人 JSON，再通过路由或构建参数选择内容。

改完内容后：

```bash
npm run build
git add src/content/site-content.json
git commit -m "Update site content"
git push origin main
```

Vercel 会根据 `main` 分支自动重新部署。

## 技术栈

- React 18
- Vite 4
- TypeScript
- GSAP ScrollTrigger
- PixiJS 8
- lucide-react
