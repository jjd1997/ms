# Content Configuration

页面展示内容集中维护在 `site-content.json`。

## 修改方式

改完 `site-content.json` 后重新构建和部署：

```bash
npm run build
git add src/content/site-content.json
git commit -m "Update site content"
git push origin main
```

Vercel 会跟随 `main` 分支自动重新部署。

## 关于注释

标准 JSON 不支持注释，所以不要在 `site-content.json` 里写 `//` 或 `/* */`。

如果需要记录说明，写在这个 README 里。以后如果多人复用频率变高，可以升级成：

- JSONC：允许注释，但需要额外解析配置。
- TypeScript 配置文件：支持注释和更强类型提示。
- CMS：适合非开发人员在线编辑。

当前阶段优先使用标准 JSON，部署最稳定，也最容易接入 Vercel。

## 多人复用预留

当前只服务一个人，所以先保留单文件 `site-content.json`。如果以后要给多人复用，建议扩展成：

- `src/content/people/jjd.json`
- `src/content/people/another-person.json`

再通过路由参数、构建环境变量或后台选择具体内容。这样每个人的内容互不污染，页面组件仍然可以复用。

## 字段说明

- `profile`：姓名、缩写、岗位、邮箱、GitHub、城市。
- `seo`：浏览器标题和搜索摘要。
- `ui`：导航、按钮、复制状态、页脚等界面文案。
- `navItems`：顶部导航。
- `hero`：首屏标题、主图、浮动卡片、说明卡片。
- `highlights`：首屏摘要小卡片。
- `sections`：各区块标题和说明。
- `capabilities`：能力卡片，`icon` 目前支持 `target`、`code`、`gauge`。
- `projects`：项目案例和右侧视觉面板内容。
- `projects[].links`：项目卡片跳转入口，可指向详情页、Demo、GitHub 或文章。
- `lab`：作品入口区，用来收纳后续 Demo、工具、实验和项目导航。
- `writing`：文章分类、文章卡片和 CTA 文案。
- `timeline`：经历时间线。
- `stack`：技术栈标签。
- `faqs`：问答内容。
- `footer`：页脚文案。
