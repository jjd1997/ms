import {
  Clipboard,
  Download,
  Eye,
  FileJson,
  Laptop,
  Monitor,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "./content/types";

type StudioSectionId = "hero" | "about" | "projects" | "lab" | "writing" | "experience" | "stack" | "faq" | "contact";
type PreviewMode = "desktop" | "tablet" | "mobile";
type SaveState = "idle" | "saving" | "saved" | "error";

const sectionMeta: Array<{
  id: StudioSectionId;
  label: string;
  hint: string;
}> = [
  { id: "hero", label: "首屏", hint: "姓名、定位、摘要和亮点" },
  { id: "about", label: "能力", hint: "工作方式和能力卡片" },
  { id: "projects", label: "项目", hint: "项目案例、结果和标签" },
  { id: "lab", label: "作品", hint: "后续项目和外部入口" },
  { id: "writing", label: "文章", hint: "分类、文章卡片和 CTA" },
  { id: "experience", label: "经历", hint: "时间线和技术栈上下文" },
  { id: "stack", label: "技术栈", hint: "技能标签云" },
  { id: "faq", label: "FAQ", hint: "面试前常见问题" },
  { id: "contact", label: "联系", hint: "邮箱、GitHub、页脚" },
];

const previewModes: Array<{
  id: PreviewMode;
  label: string;
  icon: typeof Monitor;
}> = [
  { id: "desktop", label: "桌面", icon: Monitor },
  { id: "tablet", label: "平板", icon: Tablet },
  { id: "mobile", label: "手机", icon: Smartphone },
];

function cloneContent(content: SiteContent) {
  return structuredClone(content);
}

type PreviewRenderProps = {
  activeStudioField?: string;
  activeStudioSection?: StudioSectionId;
  content: SiteContent;
  studioMode: boolean;
};

function ContentStudio({
  initialContent,
  renderPreview,
}: {
  initialContent: SiteContent;
  renderPreview: (props: PreviewRenderProps) => React.ReactNode;
}) {
  const [content, setContent] = useState(() => cloneContent(initialContent));
  const [activeSection, setActiveSection] = useState<StudioSectionId>("hero");
  const [focusedField, setFocusedField] = useState<string>();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [copyState, setCopyState] = useState("复制 JSON");
  const [saveError, setSaveError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const previewRef = useRef<HTMLDivElement>(null);

  const jsonOutput = useMemo(() => JSON.stringify(content, null, 2), [content]);

  useEffect(() => {
    const section = previewRef.current?.querySelector<HTMLElement>(".studio-section-focus");
    section?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeSection]);

  function updateContent(mutator: (draft: SiteContent) => void) {
    setContent((current) => {
      const next = cloneContent(current);
      mutator(next);
      return next;
    });
  }

  async function copyJson() {
    await navigator.clipboard.writeText(jsonOutput);
    setCopyState("已复制");
    window.setTimeout(() => setCopyState("复制 JSON"), 1800);
  }

  function downloadJson() {
    const blob = new Blob([jsonOutput], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "site-content.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetContent() {
    setContent(cloneContent(initialContent));
    setFocusedField(undefined);
    setSaveError("");
    setSaveState("idle");
  }

  async function saveContent() {
    setSaveError("");
    setSaveState("saving");

    try {
      const response = await fetch("/api/save-content", {
        body: JSON.stringify({
          content,
          message: `Update site content for ${content.profile.name || "profile"}`,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const responseText = await response.text();
      let result: { error?: string; ok?: boolean } = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(responseText || "服务端返回了非 JSON 错误。");
      }

      if (!response.ok) {
        throw new Error(result.error || "保存失败");
      }

      window.localStorage.setItem("ms-content-studio-draft", jsonOutput);
      setSaveState("saved");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败");
      setSaveState("error");
    }
  }

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar" aria-label="内容区块">
        <a className="studio-home-link" href="/">
          <Laptop aria-hidden="true" />
          <span>返回主页</span>
        </a>
        <div className="studio-title-block">
          <p className="eyebrow">Content Studio</p>
          <h1>按页面区块编辑内容</h1>
          <p>选择左侧区块，右侧只显示对应字段，中间实时预览会自动定位。</p>
        </div>
        <nav className="studio-section-nav">
          {sectionMeta.map((section) => (
            <button
              className={activeSection === section.id ? "is-active" : ""}
              type="button"
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setFocusedField(undefined);
              }}
            >
              <span>{section.label}</span>
              <small>{section.hint}</small>
            </button>
          ))}
        </nav>
      </aside>

      <main className="studio-main">
        <header className="studio-toolbar">
          <div>
            <p className="eyebrow">Live preview</p>
            <h2>{sectionMeta.find((section) => section.id === activeSection)?.label}</h2>
          </div>
          <div className="studio-toolbar-actions">
            <div className="studio-segmented" aria-label="预览尺寸">
              {previewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    className={previewMode === mode.id ? "is-active" : ""}
                    type="button"
                    key={mode.id}
                    onClick={() => setPreviewMode(mode.id)}
                    aria-label={mode.label}
                    title={mode.label}
                  >
                    <Icon aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            <button className="studio-icon-button" type="button" onClick={copyJson}>
              <Clipboard aria-hidden="true" />
              {copyState}
            </button>
            <button
              className="studio-icon-button studio-save-button"
              type="button"
              onClick={saveContent}
              disabled={saveState === "saving"}
            >
              <Save aria-hidden="true" />
              {saveState === "saving" ? "保存中" : "保存"}
            </button>
            <button className="studio-icon-button" type="button" onClick={downloadJson}>
              <Download aria-hidden="true" />
              下载
            </button>
          </div>
        </header>
        <div className={`studio-save-status studio-save-status-${saveState}`} aria-live="polite">
          {saveState === "saved"
            ? "已保存到 GitHub，Vercel 会自动部署。返回主页会先显示本机已保存内容。"
            : saveState === "error"
              ? `保存失败：${saveError}`
              : "编辑完成后点保存，系统会提交到 GitHub 并触发 Vercel 部署。"}
        </div>

        <div className="studio-workspace">
          <section className="studio-preview-panel" aria-label="页面预览">
            <div className={`studio-preview-frame studio-preview-${previewMode}`} ref={previewRef}>
              {renderPreview({
                activeStudioField: focusedField,
                activeStudioSection: activeSection,
                content,
                studioMode: true,
              })}
            </div>
          </section>

          <aside className="studio-editor-panel">
            <div className="studio-editor-header">
              <div>
                <p className="eyebrow">Edit fields</p>
                <h2>{sectionMeta.find((section) => section.id === activeSection)?.label}</h2>
              </div>
              <button className="studio-icon-button" type="button" onClick={resetContent}>
                <RotateCcw aria-hidden="true" />
                重置
              </button>
            </div>
            <SectionEditor
              activeSection={activeSection}
              content={content}
              onFieldFocus={setFocusedField}
              updateContent={updateContent}
            />
            <details className="studio-json-details">
              <summary>
                <FileJson aria-hidden="true" />
                查看当前 JSON
              </summary>
              <pre>{jsonOutput}</pre>
            </details>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SectionEditor({
  activeSection,
  content,
  onFieldFocus,
  updateContent,
}: {
  activeSection: StudioSectionId;
  content: SiteContent;
  onFieldFocus: (field?: string) => void;
  updateContent: (mutator: (draft: SiteContent) => void) => void;
}) {
  const fieldProps = {
    onFieldFocus,
  };

  if (activeSection === "hero") {
    return (
      <EditorGroup>
        <Field
          field="profile.name"
          label="姓名"
          value={content.profile.name}
          onChange={(value) => updateContent((draft) => void (draft.profile.name = value))}
          {...fieldProps}
        />
        <Field
          field="profile.initials"
          label="头像缩写"
          value={content.profile.initials}
          onChange={(value) => updateContent((draft) => void (draft.profile.initials = value))}
          {...fieldProps}
        />
        <Field
          field="profile.role"
          label="职业定位"
          value={content.profile.role}
          onChange={(value) => updateContent((draft) => void (draft.profile.role = value))}
          {...fieldProps}
        />
        <Field
          field="hero.title"
          label="首屏大标题"
          value={content.hero.title}
          onChange={(value) => updateContent((draft) => void (draft.hero.title = value))}
          {...fieldProps}
        />
        <Field
          field="hero.statement"
          label="核心表达"
          value={content.hero.statement}
          onChange={(value) => updateContent((draft) => void (draft.hero.statement = value))}
          textarea
          {...fieldProps}
        />
        <Field
          field="hero.lede"
          label="个人介绍"
          value={content.hero.lede}
          onChange={(value) => updateContent((draft) => void (draft.hero.lede = value))}
          textarea
          {...fieldProps}
        />
        {content.highlights.map((item, index) => (
          <FieldPair
            key={index}
            field={`highlights.${index}`}
            label={`摘要卡片 ${index + 1}`}
            leftValue={item.label}
            rightValue={item.value}
            onFieldFocus={onFieldFocus}
            onLeftChange={(value) => updateContent((draft) => void (draft.highlights[index].label = value))}
            onRightChange={(value) => updateContent((draft) => void (draft.highlights[index].value = value))}
          />
        ))}
      </EditorGroup>
    );
  }

  if (activeSection === "about") {
    return (
      <EditorGroup>
        <Field
          field="sections.about.title"
          label="区块标题"
          value={content.sections.about.title}
          onChange={(value) => updateContent((draft) => void (draft.sections.about.title = value))}
          textarea
          {...fieldProps}
        />
        <Field
          field="sections.about.text"
          label="区块说明"
          value={content.sections.about.text}
          onChange={(value) => updateContent((draft) => void (draft.sections.about.text = value))}
          textarea
          {...fieldProps}
        />
        {content.capabilities.map((item, index) => (
          <Field
            key={index}
            field={`capabilities.${index}.text`}
            label={`能力卡片 ${index + 1}`}
            value={`${item.title}\n${item.text}`}
            onChange={(value) =>
              updateContent((draft) => {
                const [title = "", ...text] = value.split("\n");
                draft.capabilities[index].title = title;
                draft.capabilities[index].text = text.join("\n");
              })
            }
            textarea
            {...fieldProps}
          />
        ))}
      </EditorGroup>
    );
  }

  if (activeSection === "projects") {
    return (
      <EditorGroup>
        <Field
          field="sections.projects.title"
          label="项目区标题"
          value={content.sections.projects.title}
          onChange={(value) => updateContent((draft) => void (draft.sections.projects.title = value))}
          textarea
          {...fieldProps}
        />
        {content.projects.map((project, index) => (
          <div className="studio-repeat-card" key={project.index}>
            <Field
              field={`projects.${index}.name`}
              label={`项目 ${index + 1} 名称`}
              value={project.name}
              onChange={(value) => updateContent((draft) => void (draft.projects[index].name = value))}
              {...fieldProps}
            />
            <Field
              field={`projects.${index}.result`}
              label="结果标题"
              value={project.result}
              onChange={(value) => updateContent((draft) => void (draft.projects[index].result = value))}
              textarea
              {...fieldProps}
            />
            <Field
              field={`projects.${index}.text`}
              label="项目说明"
              value={project.text}
              onChange={(value) => updateContent((draft) => void (draft.projects[index].text = value))}
              textarea
              {...fieldProps}
            />
            <Field
              field={`projects.${index}.tags`}
              label="标签，每行一个"
              value={project.tags.join("\n")}
              onChange={(value) =>
                updateContent((draft) => {
                  draft.projects[index].tags = value.split("\n").map((tag) => tag.trim()).filter(Boolean);
                })
              }
              textarea
              {...fieldProps}
            />
            <Field
              field={`projects.${index}.links`}
              label="链接，每行一个：标签 | 地址"
              value={project.links.map((link) => `${link.label} | ${link.href}`).join("\n")}
              onChange={(value) =>
                updateContent((draft) => {
                  draft.projects[index].links = parseLinks(value);
                })
              }
              textarea
              {...fieldProps}
            />
          </div>
        ))}
      </EditorGroup>
    );
  }

  if (activeSection === "lab") {
    return (
      <EditorGroup>
        <Field
          field="sections.lab.title"
          label="作品区标题"
          value={content.sections.lab.title}
          onChange={(value) => updateContent((draft) => void (draft.sections.lab.title = value))}
          textarea
          {...fieldProps}
        />
        <Field
          field="sections.lab.text"
          label="作品区说明"
          value={content.sections.lab.text}
          onChange={(value) => updateContent((draft) => void (draft.sections.lab.text = value))}
          textarea
          {...fieldProps}
        />
        {content.lab.items.map((item, index) => (
          <div className="studio-repeat-card" key={index}>
            <Field
              field={`lab.items.${index}.title`}
              label={`作品 ${index + 1} 标题`}
              value={item.title}
              onChange={(value) => updateContent((draft) => void (draft.lab.items[index].title = value))}
              {...fieldProps}
            />
            <Field
              field={`lab.items.${index}.status`}
              label="状态"
              value={item.status}
              onChange={(value) => updateContent((draft) => void (draft.lab.items[index].status = value))}
              {...fieldProps}
            />
            <Field
              field={`lab.items.${index}.text`}
              label="说明"
              value={item.text}
              onChange={(value) => updateContent((draft) => void (draft.lab.items[index].text = value))}
              textarea
              {...fieldProps}
            />
            <Field
              field={`lab.items.${index}.href`}
              label="跳转地址"
              value={item.href}
              onChange={(value) => updateContent((draft) => void (draft.lab.items[index].href = value))}
              {...fieldProps}
            />
            <Field
              field={`lab.items.${index}.tags`}
              label="标签，每行一个"
              value={item.tags.join("\n")}
              onChange={(value) =>
                updateContent((draft) => {
                  draft.lab.items[index].tags = value.split("\n").map((tag) => tag.trim()).filter(Boolean);
                })
              }
              textarea
              {...fieldProps}
            />
          </div>
        ))}
      </EditorGroup>
    );
  }

  if (activeSection === "writing") {
    return (
      <EditorGroup>
        <Field
          field="sections.writing.title"
          label="文章区标题"
          value={content.sections.writing.title}
          onChange={(value) => updateContent((draft) => void (draft.sections.writing.title = value))}
          textarea
          {...fieldProps}
        />
        <Field
          field="sections.writing.text"
          label="文章区说明"
          value={content.sections.writing.text}
          onChange={(value) => updateContent((draft) => void (draft.sections.writing.text = value))}
          textarea
          {...fieldProps}
        />
        {content.writing.posts.map((post, index) => (
          <div className="studio-repeat-card" key={index}>
            <Field
              field={`writing.posts.${index}.title`}
              label={`文章 ${index + 1} 标题`}
              value={post.title}
              onChange={(value) => updateContent((draft) => void (draft.writing.posts[index].title = value))}
              {...fieldProps}
            />
            <Field
              field={`writing.posts.${index}.excerpt`}
              label="摘要"
              value={post.excerpt}
              onChange={(value) => updateContent((draft) => void (draft.writing.posts[index].excerpt = value))}
              textarea
              {...fieldProps}
            />
          </div>
        ))}
      </EditorGroup>
    );
  }

  if (activeSection === "experience") {
    return (
      <EditorGroup>
        <Field
          field="sections.experience.title"
          label="经历区标题"
          value={content.sections.experience.title}
          onChange={(value) => updateContent((draft) => void (draft.sections.experience.title = value))}
          textarea
          {...fieldProps}
        />
        <Field
          field="sections.experience.text"
          label="经历区说明"
          value={content.sections.experience.text}
          onChange={(value) => updateContent((draft) => void (draft.sections.experience.text = value))}
          textarea
          {...fieldProps}
        />
        {content.timeline.map((item, index) => (
          <div className="studio-repeat-card" key={index}>
            <Field
              field={`timeline.${index}.title`}
              label={`${item.time} 标题`}
              value={item.title}
              onChange={(value) => updateContent((draft) => void (draft.timeline[index].title = value))}
              {...fieldProps}
            />
            <Field
              field={`timeline.${index}.text`}
              label="说明"
              value={item.text}
              onChange={(value) => updateContent((draft) => void (draft.timeline[index].text = value))}
              textarea
              {...fieldProps}
            />
          </div>
        ))}
      </EditorGroup>
    );
  }

  if (activeSection === "stack") {
    return (
      <EditorGroup>
        <Field
          field="sections.stack.title"
          label="技术栈标题"
          value={content.sections.stack.title}
          onChange={(value) => updateContent((draft) => void (draft.sections.stack.title = value))}
          {...fieldProps}
        />
        <Field
          field="stack"
          label="技术标签，每行一个"
          value={content.stack.join("\n")}
          onChange={(value) =>
            updateContent((draft) => {
              draft.stack = value.split("\n").map((item) => item.trim()).filter(Boolean);
            })
          }
          textarea
          {...fieldProps}
        />
      </EditorGroup>
    );
  }

  if (activeSection === "faq") {
    return (
      <EditorGroup>
        <Field
          field="sections.faq.title"
          label="FAQ 标题"
          value={content.sections.faq.title}
          onChange={(value) => updateContent((draft) => void (draft.sections.faq.title = value))}
          {...fieldProps}
        />
        {content.faqs.map((faq, index) => (
          <div className="studio-repeat-card" key={index}>
            <Field
              field={`faqs.${index}.q`}
              label={`问题 ${index + 1}`}
              value={faq.q}
              onChange={(value) => updateContent((draft) => void (draft.faqs[index].q = value))}
              {...fieldProps}
            />
            <Field
              field={`faqs.${index}.a`}
              label="回答"
              value={faq.a}
              onChange={(value) => updateContent((draft) => void (draft.faqs[index].a = value))}
              textarea
              {...fieldProps}
            />
          </div>
        ))}
      </EditorGroup>
    );
  }

  return (
    <EditorGroup>
      <Field
        field="profile.email"
        label="邮箱"
        value={content.profile.email}
        onChange={(value) => updateContent((draft) => void (draft.profile.email = value))}
        {...fieldProps}
      />
      <Field
        field="profile.github"
        label="GitHub"
        value={content.profile.github}
        onChange={(value) => updateContent((draft) => void (draft.profile.github = value))}
        {...fieldProps}
      />
      <Field
        field="sections.contact.title"
        label="联系区标题"
        value={content.sections.contact.title}
        onChange={(value) => updateContent((draft) => void (draft.sections.contact.title = value))}
        textarea
        {...fieldProps}
      />
      <Field
        field="sections.contact.text"
        label="联系区说明"
        value={content.sections.contact.text}
        onChange={(value) => updateContent((draft) => void (draft.sections.contact.text = value))}
        textarea
        {...fieldProps}
      />
      <Field
        field="footer.copyright"
        label="页脚版权"
        value={content.footer.copyright}
        onChange={(value) => updateContent((draft) => void (draft.footer.copyright = value))}
        {...fieldProps}
      />
    </EditorGroup>
  );
}

function EditorGroup({ children }: { children: React.ReactNode }) {
  return <div className="studio-editor-group">{children}</div>;
}

function parseLinks(value: string) {
  return value
    .split("\n")
    .map((line) => {
      const [label = "", href = ""] = line.split("|").map((part) => part.trim());
      return { href, label };
    })
    .filter((link) => link.href && link.label);
}

function Field({
  field,
  label,
  onChange,
  onFieldFocus,
  textarea = false,
  value,
}: {
  field: string;
  label: string;
  onChange: (value: string) => void;
  onFieldFocus: (field?: string) => void;
  textarea?: boolean;
  value: string;
}) {
  const sharedProps = {
    onBlur: () => onFieldFocus(undefined),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    onFocus: () => onFieldFocus(field),
    onMouseEnter: () => onFieldFocus(field),
    onMouseLeave: () => onFieldFocus(undefined),
    value,
  };

  return (
    <label className="studio-field">
      <span>{label}</span>
      {textarea ? <textarea rows={4} {...sharedProps} /> : <input type="text" {...sharedProps} />}
    </label>
  );
}

function FieldPair({
  field,
  label,
  leftValue,
  onFieldFocus,
  onLeftChange,
  onRightChange,
  rightValue,
}: {
  field: string;
  label: string;
  leftValue: string;
  onFieldFocus: (field?: string) => void;
  onLeftChange: (value: string) => void;
  onRightChange: (value: string) => void;
  rightValue: string;
}) {
  return (
    <fieldset className="studio-field-pair">
      <legend>{label}</legend>
      <Field field={field} label="标签" value={leftValue} onChange={onLeftChange} onFieldFocus={onFieldFocus} />
      <Field field={field} label="内容" value={rightValue} onChange={onRightChange} onFieldFocus={onFieldFocus} />
    </fieldset>
  );
}

export default ContentStudio;
