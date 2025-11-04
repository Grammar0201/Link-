# LinkNote 后端 API 文档

本文档基于当前工作区的 Spring Boot 源码梳理而成，描述了服务端可用的 REST 接口、请求参数、示例请求与示例响应。本文档未对后端代码进行任何修改。

> 基于代码位置：`src/main/java/com/example/linknote/controller/*`

## 基础信息

- 服务地址（示例）: `http://localhost:8080/linknote`
- 端口: `8080`（见 `src/main/resources/application.properties`）
- 上下文路径: `/linknote`（见 `src/main/resources/application.properties`）
- 全局鉴权（见 `SecurityConfig`）：
  - 下列接口已放开（permitAll）：`/api/auth/**`, `/api/ask`, `/api/files/**`, `/api/questions/**`, `/api/wrong-answers/**`
  - 其他路径需鉴权（当前项目中几乎所有接口都在上述白名单内）

---

## 认证 Auth（`/api/auth`）

### POST `/api/auth/register`
- 描述：注册用户
- 请求体（JSON）
```
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "123456",
  "avatarIndex": 2
}
```
- 成功响应 200（JSON，User）
```
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "password": "$2a$10$******************************",
  "avatarIndex": 2,
  "level": 0,
  "experiencePoints": 0,
  "createdAt": "2025-01-10T12:34:56",
  "updatedAt": null,
  "lastLogin": null
}
```
- 失败响应 400（文本）
```
用户名已存在
```
- cURL 示例
```
curl -X POST http://localhost:8080/linknote/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"123456","avatarIndex":2}'
```

### POST `/api/auth/login`
- 描述：用户登录（成功后会更新 `lastLogin`）
- 请求体（JSON）
```
{
  "username": "alice",
  "password": "123456"
}
```
- 成功响应 200（JSON，User）
```
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "password": "$2a$10$******************************",
  "avatarIndex": 2,
  "level": 0,
  "experiencePoints": 0,
  "createdAt": "2025-01-10T12:34:56",
  "updatedAt": null,
  "lastLogin": "2025-01-11T09:08:07"
}
```
- 失败响应 400（文本）
```
登录失败
```
- cURL 示例
```
curl -X POST http://localhost:8080/linknote/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"123456"}'
```

> 注意：当前实现直接返回 User 实体，其中包含 `password` 字段（通常为哈希）。生产环境建议隐藏该字段。

---

## 文件 Files（`/api/files`）

### POST `/api/files/upload`
- 描述：上传 PDF 文件并触发异步处理（含调用 Python 插入数据库）
- 表单字段（multipart/form-data）
  - `file`: 文件
  - `userId`: Long 用户 ID
- 成功响应 202（JSON）
```
{ "message": "文件上传成功，处理中，并已插入数据库" }
```
- 另一种成功但插入失败的响应 202（JSON）
```
{ "message": "文件上传成功，处理中，但数据库插入失败" }
```
- 失败响应 500（JSON）
```
{ "error": "错误信息" }
```
- cURL 示例
```
curl -X POST http://localhost:8080/linknote/api/files/upload \
  -F "file=@/path/to/file.pdf" \
  -F "userId=1"
```

### GET `/api/files/{userId}`
- 描述：获取用户上传的 PDF 列表
- 成功响应 200（JSON，PdfDocument[]）
```
[
  {
    "id": 10,
    "fileName": "notes.pdf",
    "filePath": "notes_10.pdf",
    "category": "数学",
    "uploadTime": "2025-01-10T10:20:30",
    "fileRoot": "/home/ubuntu/app/uploads",
    "user": { "id": 1, "username": "alice" }
  }
]
```
- 无数据 404（文本）
```
用户未上传文件
```
- cURL 示例
```
curl http://localhost:8080/linknote/api/files/1
```

### DELETE `/api/files/delete/{fileId}`
- 描述：删除指定文件及其相关数据
- 成功响应 200（文本）
```
文件及相关数据删除成功
```
- 失败响应 500（文本）
```
删除失败: 详细错误
```
- cURL 示例
```
curl -X DELETE http://localhost:8080/linknote/api/files/delete/10
```

### POST `/api/files/note`
- 描述：创建用户自写笔记
- 请求体（JSON）
```
{ "title": "微积分总结", "content": "内容...", "userId": 1 }
```
- 成功响应 200（JSON，Note）
```
{
  "id": 3,
  "title": "微积分总结",
  "content": "内容...",
  "category": null,
  "createdAt": "2025-01-10T11:22:33"
}
```
- cURL 示例
```
curl -X POST http://localhost:8080/linknote/api/files/note \
  -H "Content-Type: application/json" \
  -d '{"title":"微积分总结","content":"内容...","userId":1}'
```

### GET `/api/files/notes/{userId}`
- 描述：获取用户自写笔记列表
- 成功响应 200（JSON，Note[]）
```
[
  {
    "id": 3,
    "title": "微积分总结",
    "content": "内容...",
    "category": null,
    "createdAt": "2025-01-10T11:22:33"
  }
]
```
- 无数据 404（文本）
```
用户未创建笔记
```
- cURL 示例
```
curl http://localhost:8080/linknote/api/files/notes/1
```

### DELETE `/api/files/delete/{noteId}`
- 描述：删除用户自写笔记（注意：当前实现与删除文件走同一删除服务方法）
- 成功响应 200（文本）
```
笔记删除成功
```
- 失败响应 500（文本）
```
删除失败: 详细错误
```
- cURL 示例
```
curl -X DELETE http://localhost:8080/linknote/api/files/delete/3
```

---

## 题目 Questions（`/api/questions`）

### GET `/api/questions/{userId}/unanswered`
- 描述：获取用户未回答的题目列表
- 成功响应 200（JSON，Question[]）
```
[
  {
    "id": 101,
    "content": "以下哪项是导数的定义？",
    "answer": "B",
    "difficulty": "EASY",
    "type": "SINGLE",
    "options": ["A","B","C","D"],
    "document": { "id": 10 },
    "user": { "id": 1 }
  }
]
```
- cURL 示例
```
curl http://localhost:8080/linknote/api/questions/1/unanswered
```

### POST `/api/questions/generate`
- 描述：基于文档生成题目
- 请求体（JSON）
```
{ "documentId": 10, "count": 5 }
```
- 成功响应 200（JSON，Question[]）
```
[
  { "id": 201, "content": "...", "answer": "C", "difficulty": "MEDIUM", "type": "SINGLE", "options": ["A","B","C","D"], "document": {"id": 10}, "user": {"id": 1} }
]
```
- cURL 示例
```
curl -X POST http://localhost:8080/linknote/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"documentId":10,"count":5}'
```

### POST `/api/questions/submit`
- 描述：提交答题结果
- 请求体（JSON）
```
{ "questionId": 201, "answer": "C" }
```
- 成功响应 200（JSON，UserAnswer）
```
{
  "id": 9001,
  "question": { "id": 201 },
  "user": { "id": 1 },
  "userAnswer": "C",
  "correct": true
}
```
- cURL 示例
```
curl -X POST http://localhost:8080/linknote/api/questions/submit \
  -H "Content-Type: application/json" \
  -d '{"questionId":201,"answer":"C"}'
```

---

## 问答 Ask（`/api/ask`）

### POST `/api/ask`
- 描述：向外部模型提问，返回答案
- 请求体（JSON）
```
{ "question": "微积分的基本定理是什么？" }
```
- 成功响应 200（JSON）
```
{ "answer": "...外部模型生成的答案..." }
```
- 失败响应 500（文本）
```
获取答案失败: 详细错误
```
- cURL 示例
```
curl -X POST http://localhost:8080/linknote/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"微积分的基本定理是什么？"}'
```

> 外部 API 相关配置见 `src/main/resources/application.properties` 中 `deepseekr1.api.url` 与 `deepseekr1.api.key`。

---

## 错题 Wrong Answers（`/api/wrong-answers`）

### GET `/api/wrong-answers`
- 描述：获取当前登录用户的错题列表（依赖 `@AuthenticationPrincipal`）
- 成功响应 200（JSON，WrongAnswer[]）
```
[
  {
    "id": 301,
    "user": { "id": 1 },
    "question": { "id": 201 },
    "wrongAnswer": "A",
    "createdAt": "2025-01-10T13:14:15",
    "pdfDocument1": { "id": 10 },
    "category": "数学/微积分"
  }
]
```

### GET `/api/wrong-answers/page/{userid}`
- 描述：分页获取指定用户的错题
- 查询参数：Spring Pageable（如 `?page=0&size=10&sort=createdAt,desc`）
- 成功响应 200（JSON，Page<WrongAnswer>）
```
{
  "content": [
    { "id": 301, "user": {"id": 1}, "question": {"id": 201}, "wrongAnswer": "A", "createdAt": "2025-01-10T13:14:15", "pdfDocument1": {"id": 10}, "category": "数学/微积分" }
  ],
  "pageable": { "sort": { "sorted": true, "unsorted": false, "empty": false }, "pageNumber": 0, "pageSize": 10, "offset": 0, "paged": true, "unpaged": false },
  "last": true,
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "sort": { "sorted": true, "unsorted": false, "empty": false },
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
```
- cURL 示例
```
curl "http://localhost:8080/linknote/api/wrong-answers/page/1?page=0&size=10&sort=createdAt,desc"
```

### GET `/api/wrong-answers/answers/{userid}`
- 描述：获取指定用户的全部错题
- 成功响应 200（JSON，WrongAnswer[]）
```
[
  { "id": 301, "user": {"id": 1}, "question": {"id": 201}, "wrongAnswer": "A", "createdAt": "2025-01-10T13:14:15", "pdfDocument1": {"id": 10}, "category": "数学/微积分" }
]
```

### DELETE `/api/wrong-answers/delete/{id}`
- 描述：删除错题记录
- 成功响应 204（无内容）

### GET `/api/wrong-answers/question/{questionId}`
- 描述：获取某题的所有错答记录
- 成功响应 200（JSON，WrongAnswer[]）
```
[
  { "id": 401, "user": {"id": 1}, "question": {"id": 201}, "wrongAnswer": "B", "createdAt": "2025-01-10T14:00:00", "pdfDocument1": {"id": 10}, "category": "数学/微积分" }
]
```

### GET `/api/wrong-answers/wrong/analyse/{userId}`
- 描述：获取用户错题分析数据
- 成功响应 200（JSON）
```
{
  "userId": 1,
  "analysis": {
    "byCategory": { "数学/微积分": 5, "线性代数": 2 },
    "accuracy": 0.78
  }
}
```

### GET `/api/wrong-answers/wrong/{category}`
- 描述：按类别筛选错题
- 成功响应 200（JSON，WrongAnswer[]）
```
[
  { "id": 501, "user": {"id": 1}, "question": {"id": 201}, "wrongAnswer": "D", "createdAt": "2025-01-10T15:00:00", "pdfDocument1": {"id": 10}, "category": "数学/微积分" }
]
```

---

## 通用状态码

- 200 OK：请求成功
- 202 Accepted：已接受处理（异步处理，如文件上传）
- 204 No Content：删除成功
- 400 Bad Request：业务失败（如注册/登录失败）
- 404 Not Found：资源不存在（如未上传文件/未创建笔记）
- 500 Internal Server Error：系统异常（上传/删除异常、外部服务失败等）

---

## 附录：主要实体字段

- User：`id, username, email, password, avatarIndex, level, experiencePoints, createdAt, updatedAt, lastLogin`
- PdfDocument：`id, fileName, filePath, category, uploadTime, fileRoot, user`
- Note：`id, title, content, category, createdAt`
- Question：`id, content, answer, difficulty, type, options, document, user`
- UserAnswer：`id, question, user, userAnswer, correct`
- WrongAnswer：`id, user, question, wrongAnswer, createdAt, pdfDocument1, category`

> 提示：当前返回值均为直接序列化的实体对象，某些字段可能因懒加载或 Jackson 配置而显示为对象或仅包含 `id`。实际响应结构可能随持久化加载策略而略有不同。

---

## 示例基地址与环境

- Base URL：`http://localhost:8080/linknote`
- 相关配置：`src/main/resources/application.properties`
  - `server.port=8080`
  - `server.servlet.context-path=/linknote`
  - `spring.datasource.*`（数据库）
  - `deepseekr1.api.*`（外部问答接口）

---

最后更新：以当前仓库源代码为准（生成于文档创建时）。

