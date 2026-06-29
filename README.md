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

工作台支持按页面区块编辑、实时预览、桌面/平板/手机预览切换、复制/下载当前 `site-content.json`，以及保存到 GitHub。

要启用“保存”按钮，需要在 Vercel 项目环境变量里配置：

```bash
GITHUB_TOKEN=你的 GitHub fine-grained token
GITHUB_OWNER=jjd1997
GITHUB_REPO=ms
GITHUB_BRANCH=main
```

Token 只需要对 `jjd1997/ms` 仓库有 Contents 读写权限。保存成功后会更新 `src/content/site-content.json`，GitHub 会触发 Vercel 自动部署。保存成功后，当前浏览器也会先用本地缓存展示新内容，所以点“返回主页”能立刻看到刚保存的版本。

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
