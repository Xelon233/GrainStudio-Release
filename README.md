# Grain Studio

> 光影有度，胶片归真。工具隐入暗处，光影自然浮现。

**Grain Studio** 是一款面向 macOS（14.0+）与 iPadOS（17.0+）的原生胶片色彩与 RAW 影调工作站，本仓库为其**官方发布页与公开发行包仓库**（仅提供编译打包后的应用安装包与官网，不包含源码）。

- **官方网站**：<https://xelon233.github.io/GrainStudio-Release/>
- **最新版本**：**v1.1.28 (Build 39)**
- **安装包下载**：前往 [Releases 页面](https://github.com/Xelon233/GrainStudio-Release/releases/latest) 获取 `Grain Studio 1.1.28.dmg`
- **系统要求**：macOS 14.0 Sonoma 或更高版本（Apple Silicon / Intel），iPadOS 17.0+ 协同适配（由 [@DavidPisces](https://github.com/DavidPisces) 协同适配）

---

## 核心特性

- **16 位 RAW 无损解码与 ACR 通透影调**：零磁盘 I/O 内存管线与 16 位 S 型色调映射，压实暗部黑位、消除泛灰，RAW 冷解码提速 67.4%（13.81s → 4.50s）。
- **87 款原厂色彩科学与 CST 内核**：内置 Hasselblad HNCS、Fujifilm F-Log2（Classic Neg / Velvia / Eterna / Reala Ace 等）、ARRI LogC4 与 RED 电影色彩科学。
- **端侧 Apple 神经引擎矩阵**：ELD Bayer RAW 域降噪、NAFNet 高频残差保真降噪、AIperture 光学景深散景与 SkySeg 天空语义分割，全流程本地运行，零云端上传。
- **人像质感重塑（非磨皮保真）**：Vision 76 关键点定位与色相走廊动态皮肤蒙版，近邻取色去瑕疵并无损加回 `0.75–1.35px` 原生微毛孔层。
- **Metal 60fps 画布与全格式导出**：支持 `8/16/32 位 TIFF`、`PNG`、`JPEG`、`HEIC`、`AVIF`、`DNG` 无损导出与受限并发批量处理。

---

## 安装与首次打开说明

1. 从 [Releases](https://github.com/Xelon233/GrainStudio-Release/releases/latest) 下载 `Grain Studio 1.1.28.dmg`。
2. （可选）校验 SHA-256 指纹：
   ```zsh
   shasum -a 256 "Grain Studio 1.1.28.dmg"
   ```
   预期摘要见 [SHA256SUMS.txt](./SHA256SUMS.txt)：
   `1e18140593b3192f74795ec9c7e8354937f5ff5b50319b985cb2bbdfc90253aa`
3. 双击 DMG：系统会先弹出《Grain Studio 用户协议（免费版）》，点击「同意」后即可将 `Grain Studio.app` 拖入「应用程序」。
4. 首次打开若遇到 macOS Gatekeeper 提示未验证开发者，请前往「系统设置 → 隐私与安全性」点击「仍要打开」（或右键应用图标 →「打开」）。

---

## 许可协议

本软件遵循 [用户协议-免费版.txt](./用户协议-免费版.txt) 分发：支持个人创作、工作室与商业摄影项目免费使用；导出成品版权完全归创作者所有，无功能锁、无使用期限、无强制水印、无联网验证。
