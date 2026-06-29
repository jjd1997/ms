# jjd 个人面试博客主页

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

也可以打开内容工作台可视化编辑：

```bash
http://127.0.0.1:5173/content-studio
```

工作台支持按页面区块编辑、实时预览、桌面/平板/手机预览切换，以及复制或下载当前 `site-content.json`。静态部署版本不能直接写回 GitHub，导出的 JSON 需要替换 `src/content/site-content.json` 后再提交。

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
