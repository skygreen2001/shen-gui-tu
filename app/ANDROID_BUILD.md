# ShenGuiTu - Android 构建说明

## 项目状态

- ✅ iOS 构建已完成
- ⚠️ Android 配置已完成，需要在 Android Studio 中构建

---

## 构建方式

### 方式 1：使用 Android Studio（推荐）

这是最可靠的构建方式，会自动处理所有依赖和 SDK 配置。

#### 步骤：

1. **打开 Android Studio**

2. **打开项目**
   - 选择 `Open an existing project`
   - 选择文件夹：`/Users/skygreen/Downloads/yy/app/android`

3. **等待 Gradle 同步**
   - Android Studio 会自动下载所需的依赖
   - 等待底部的进度条完成

4. **构建 APK**
   - 点击菜单：`Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - 或者使用快捷键：`Cmd + F9`

5. **找到 APK**
   - 构建完成后会有一个通知
   - 点击通知中的 `locate` 链接
   - APK 位置：`app/build/outputs/apk/debug/app-debug.apk`

---

### 方式 2：使用命令行（需配置环境）

如果您希望在系统终端中构建（不是 Trae IDE 终端），可以使用以下步骤：

#### 步骤：

1. **打开系统终端**（Terminal.app 或 iTerm）

2. **进入项目目录**
   ```bash
   cd /Users/skygreen/Downloads/yy/app
   ```

3. **运行构建脚本**
   ```bash
   # Debug 构建
   ./build-android.sh
   
   # Release 构建
   ./build-android.sh release
   ```

4. **或者使用 Gradle 直接构建**
   ```bash
   cd android
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
   /Users/pupu/Tools/gradle-9.4.1/bin/gradle app:assembleDebug
   ```

---

## 项目文件结构

```
app/
├── android/
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/com/shenguitu/
│   │   │       │   ├── MainActivity.kt
│   │   │       │   └── MainApplication.kt
│   │   │       ├── res/
│   │   │       └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle.properties
├── build-android.sh  ← 构建脚本
└── (React Native 源文件...)
```

---

## 环境要求

已配置：
- ✅ Java 17 (`/opt/homebrew/opt/openjdk@17`)
- ✅ Gradle 9.4.1 (`/Users/pupu/Tools/gradle-9.4.1`)
- ✅ Android SDK (`/Users/skygreen/Library/Android/sdk`)

需要：
- ⚠️ Android Studio（推荐用于构建）

---

## 常见问题

### Q: 找不到 Gradle Wrapper？

A: 使用 Android Studio 或者直接使用您安装的 Gradle 9.4.1。

### Q: SDK 目录无写入权限？

A: 在系统终端中运行，Trae IDE 的沙箱限制了文件系统访问。

### Q: React Native Gradle Plugin 找不到？

A: 使用 Android Studio，它会自动处理这个问题。

---

## 输出文件

### Android APK
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### iOS App（已完成）
- Debug: `ios/build/ShenGuiTu.app`

---

## 下一步

1. 在 Android Studio 中打开项目
2. 构建 Debug APK
3. 测试应用
4. （可选）构建 Release 版本

---

## 联系方式

如有问题，请查看构建日志或使用 `--info` 参数获取详细信息。
