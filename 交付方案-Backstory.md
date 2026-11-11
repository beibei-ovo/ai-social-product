# Backstory 产品方案

面向北美英语用户的 AI 社交 Demo · 2026 年 11 月 11 日

Backstory 想留住一个很小的社交时刻。你听到别人讲了一件事，觉得和自己有关，于是认真问了一句，“后来呢？”

产品从这里展开。用户可以分享图文经历，也可以先和自己的 AI 聊聊。分身在对话里找到一段适合分享的内容，写好草稿，等本人确认。别人对帖子感兴趣时，可以先向分身追问已有细节，再把新的问题留给作者。一次阅读，有机会变成两个人之间的来往。

## 一、先打开 Demo 看一遍

### HTML 演示文件

下载本节的 HTML 附件，用 Edge、Chrome 或 Safari 等现代浏览器打开即可。图片和示例录音已嵌入文件，浏览不依赖另外下载素材。首次打开后建议按下面的顺序体验。

1. 在 Explore 往下刷图文帖。首页有六个主题、18 条示例帖子，也可以直接问“下班没精力打排位，但还想和朋友一起玩”，看看系统找到哪些相关经历。
2. 进入 My AI。里面有跨几天的 28 条聊天记录。点 History 可以从头看，滑到最近一段，可以看到分身提炼的记忆和已经写好的图文草稿。
3. 点 Review draft，修改标题、正文、配图或圈子。预览时选择允许分身引用的部分，确认发布后，再回 Explore 看自己的帖子。
4. 打开 Maya 的独居故事。Discussion 展示真人评论、分身回答和作者亲自补充。点 Ask Maya’s twin，可以问一个原声覆盖的问题，也可以把新问题留给作者。
5. 点作者头像进入主页，再点 Message 发私信。Inbox 的 Notifications 收纳追问和补答，Chats 收纳私信。在 Me 切换演示身份，可以从另一方继续回复。

演示采用虚构人物、示例聊天和主题配图，AI 回答与草稿提炼为本地模拟。消息、上传图片和草稿保存在当前浏览器。共享文件给另一个人后，双方各自操作各自的演示数据。当前版本已通过 21 项浏览器验收，包括确认后发布、引用撤回、私聊隔离、图片上传、旧数据恢复和双向私信。

### 界面预览

预览 · 图文发现

Explore 把图片、经历标题和作者放在一张卡片里。输入问题后，返回的也是可以直接打开的帖子，并说明为什么与这次问题相关。

预览 · My AI 与发布草稿

私人聊天保留上下文，草稿卡片给出配图、文案和建议圈子。用户可以编辑、留到以后，也可以继续聊天。

预览 · 私信

作者主页连接到聊天。私信与帖子追问都能在 Inbox 找到，各自有清楚的入口。

## 二、App Store 产品介绍文案

以下为 en-US 版本，面向美国、加拿大等北美英语用户。名称暂用 Backstory。文案依据拟上线产品的功能撰写，正式提审时需要与实际交付的 App、隐私说明和截图逐项对应。

### App Name

```text
Backstory: Stories & Your AI
```

### Subtitle

```text
Real stories. Keep talking.
```

### Promotional Text

```text
Every story has a “what happened next?” Share photo stories, think out loud with your AI, and meet the people behind the moments that stay with you.
```

### Description

```text
Every story has a “what happened next?”

The apartment that finally feels like home. The game night that helped friends stay close. The first solo trip that went somewhere unexpected.

Backstory is a place to share those moments and get to know the people behind them.

FIND A STORY YOU WANT TO ASK ABOUT
Explore photo stories about games, work, travel, hobbies, relationships, and everyday life. Browse circles or ask a question in your own words to find relevant experiences.

THINK OUT LOUD WITH YOUR OWN AI
Talk about your day, add a photo, or work through a thought. Review the memories you want your AI to keep, and edit or forget them as you go.

TURN A CONVERSATION INTO A POST
When a story takes shape, your AI can put together a draft. Review the words, choose the photos and circle, and publish when you're ready. You decide what leaves your private chat.

ASK WHAT HAPPENED NEXT
An author's AI twin can answer from the story details they've approved. See what the answer draws on, or send a new question to the person who lived it. AI replies and human replies are clearly labeled.

KEEP THE CONVERSATION GOING
Read the discussion, visit someone's profile, or send a direct message. Find follow-up replies and private chats in your inbox, and come back when there's more to the story.

Share a little. Ask a little. See where the conversation goes.
```

### Keywords

```text
social,photo,journal,friends,community,circles,conversation,memories,experiences,chat
```

Apple 对名称和副标题分别设有 30 字符上限，推广文字上限 170 字符，Description 上限 4,000 字符，关键词上限 100 字节。以上字段已按这些限制检查，Description 使用可直接复制的纯文本。 [App 信息](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/) · [版本信息](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)

正式上架还有实际功能需要补齐。公开帖子和私信需要内容处理、举报、屏蔽与用户可联系到的支持渠道。接入第三方 AI 前，需要明确告知哪些个人数据会发送给谁，并取得同意。支持网址、隐私政策、账号删除和年龄分级也要与实际服务一致。这些是上架前的交付工作，HTML Demo 用于说明产品体验。 [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## 三、我为什么这样设计

### 一张照片让人停下，一句追问才让人靠近

我想做的社交，起点可以很普通。一个人搬家三周，纸箱一直没拆，今天在窗边放好了一张椅子，忽然觉得这里像家了。这张照片本身值得看，但真正可能让另一个人靠近的，是他也刚搬出来住，想问“你下班回家时还会觉得空吗？”

这个问题比“你喜欢什么”更具体。它给了两个人一个自然的共同背景，也给了对方一个容易回答的入口。主页和兴趣标签仍然有用，但认识一个人的理由可以先发生在一条帖子里。

我在公开社区里看到过这种行为。有人问独居后有什么出乎意料的变化，评论里有人说喜欢安静，也有人说最难熬的是周末。能聊下去的地方，往往就是这些不完全相同的体验。它说明用户愿意听亲历者讲细节。至于他们会不会为 Backstory 换一个入口，还需要产品自己证明。 [独居讨论](https://www.reddit.com/r/LivingAlone/comments/1ldnmni)

因此，Explore 做成图文 feed。照片帮助人快速判断“这和我的生活有没有关系”，标题再留下一个值得问的细节。匹配结果也直接展示帖子。如果用户已经说出自己的处境，我更希望他立刻看到一个相关的人和一段经历，随后再决定是否关注圈子。

游戏、工作、旅行和生活是便于进入的主题。更细的圈子要靠持续交流长出来。同一段经历也可以出现在不同圈子里。例如，半小时的合作游戏既是游戏体验，也可能是几个忙起来的朋友维持联系的方法。用户可以同时在一个圈子回答问题，在另一个圈子问出自己的第一个问题。

### 先把话说出来，再决定要不要发出去

发帖有一道容易被低估的门槛。用户明明有东西想说，但一打开编辑页，就开始考虑别人会怎么看、怎么写才像一条值得发布的内容。很多小经历在这一步就停下了。

My AI 给这件事留了一个更松弛的入口。用户可以先聊自己的近况，补一张照片，解释一句刚才没说清楚的话。等经历有了足够具体的细节，分身再提出一份草稿。用户看到的已经是一条可以判断“像不像我、要不要发”的内容，随后可以改、删、换图，或者留到以后。

这里我最在意的是提出草稿的时机。每次倾诉后都追问要不要发帖，会让私人空间变得像内容工厂。因此，一段经历只主动建议一次。用户选择 Later 后，建议收起来，聊天继续。草稿里的感受和结果，要能对应到用户真正说过的话。用户修改文案的动作，也比一开始填写一排性格标签更能说明他想怎样表达自己。

### 分身知道得多，用户更需要看得见边界

参考 Second Me，我保留了可以查看和修正的记忆。参考 Elys，我希望分身能接住一部分重复互动。Character.AI 给我的启发是，用户可以从一个具体情境马上开始说话。Backstory 把这三件事落在单条经历上，让用户始终能看到分身这次用了什么。 [Second Me](https://docs.second.me/) · [Elys](https://apps.apple.com/cn/app/elys/id6754834695) · [Character.AI Scenes](https://blog.character.ai/introducing-scenes-your-new-way-to-tell-stories-on-c-ai/)

“记住”“发布”“允许分身引用”是三个独立决定。用户可以让 AI 记得自己最近在适应独居，也可以发布窗边的照片，但把某个只想私下说的称呼留在聊天里。别人追问时，分身读取的是这条帖子获得授权的素材，并给出出处。出现新问题，用户可以选择把它交给作者。

这会损失一些即时回答率，我接受这个代价。如果分身替主人猜出一个听起来很动人的理由，读者可能得到了一段流畅的回答，却误以为那个人真的这样想过。对社交产品来说，这种错位会影响下一次真人交流。所以，真人发帖、真人评论和分身回复要在界面上清楚区分，作者也能随时撤回引用权限。

### AI 接住开头，把有分量的部分留给本人

我希望作者收到的是值得补充的新问题。某个已经讲过的细节，可以先由分身引用原声回答。当有人问到“三个月后怎样了”，作者才需要回来补上新的一段。这个问题本身也在告诉作者，有人认真听了他的经历。

两个人愿意继续聊，就可以从头像进入主页，发一条私信。Inbox 因此保留两种入口。Notifications 让人找到围绕帖子发生的追问和补答，Chats 让人接着认识对方。公开帖子是相遇的地方，私信给后续交流留空间。

这也是我对独立 App 的期待。第一条分享链接可以直接打开，先让一次阅读和追问成立。如果用户后来愿意回来等某个人的更新，继续与自己的分身整理经历，或者给之前聊过的人发一条新消息，Backstory 才逐渐有了留在手机里的理由。

### 我会看两个人有没有继续聊

现在还没有真实用户留存、付费或真人回复率的数据。Demo 的验收说明这些流程能操作，用户是否需要它，要用另外一轮测试回答。

我会先邀请一小批英语用户带着真实经历来用，观察两周。最想看的是，一次追问发出后，作者是否补答，提问的人是否回来继续回应。这两步之间断在哪里，比生成了多少草稿更能指导下一次改动。

如果草稿经常被关闭，要检查提议时机、表达是否像本人，以及用户是否原本就想公开。如果图片带来了点击，却没有带来问题，就要重新看标题和内容有没有留下真实的交流空间。如果用户都在和 AI 聊，而作者很少回来，我会把真人接手的入口放得更清楚，并减少分身替人延长对话的冲动。

付费也要等具体需求出现。游戏玩家已有为录像复盘付费的行为，但那笔钱对应的是一个明确的反馈结果。Backstory 可以小范围试验一次有时限、有交付内容的真人答复，并记录实际付款和复购。生活圈能否付费，目前没有足够证据。先把第一次交流和第二次回访做出来，才能知道用户究竟在为什么留下。 [Metafy 录像复盘](https://help.metafy.gg/en/articles/11535324-how-to-book-a-session)
