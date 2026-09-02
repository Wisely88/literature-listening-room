# 环境音资源来源

环境音均在服务端预处理为 MP3，仅作为低音量循环氛围层。转换处理包括声道、采样率、码率与响度标准化；未加入旋律或人声。

| 本地文件 | 内容 | 来源与授权 |
|---|---|---|
| `rain-soft.mp3` | NASA 雨滴实录 | [NASA Earth Observatory: Listening to Raindrops](https://science.nasa.gov/earth/earth-observatory/listening-to-raindrops/)，美国联邦政府作品，Public Domain |
| `ocean-night.mp3` | 海岸近距离海浪 | [Oceanwavescrushing.ogg](https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg)，Luftrum，CC BY 3.0 |
| `fireplace.mp3` | 营火燃烧 | [Campfire sound ambience.ogg](https://commons.wikimedia.org/wiki/File:Campfire_sound_ambience.ogg)，Glaneur de sons，CC BY 3.0 |
| `insects-night.mp3` | 草虫鸣叫 | [Grasshoppers.ogg](https://commons.wikimedia.org/wiki/File:Grasshoppers.ogg)，Mysid，Public Domain |
| `wind-soft.mp3` | 建筑内风声 | [Howling wind.ogg](https://commons.wikimedia.org/wiki/File:Howling_wind.ogg)，Tvabutzku1234，CC0 1.0 |

## 本项目所做修改

- 转码为 44.1 kHz、双声道、128 kbps MP3。
- 使用统一目标响度，避免不同场景切换时突然过响或过轻。
- 浏览器端仅做独立音量、循环和淡入淡出控制。
- 海浪与篝火素材依照 CC BY 3.0 保留作者、来源和许可信息。

