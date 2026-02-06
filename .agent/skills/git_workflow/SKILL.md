---
name: RecipeVision Git Workflow
description: RecipeVision 프로젝트 Git 커밋, 브랜치, PR 컨벤션 가이드
---

# RecipeVision Git 워크플로우

> 프로젝트 Git 사용 규칙 및 컨벤션

---

## 커밋 메시지 컨벤션

### 형식
```
<type>(<scope>): <subject>

<body>
```

### Type
| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 포맷팅, 세미콜론 누락 등 |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 코드 추가/수정 |
| `chore` | 빌드, 패키지 매니저 설정 등 |

### Scope
| Scope | 설명 |
|-------|------|
| `backend` | Backend 관련 |
| `frontend` | Frontend 관련 |
| `api` | API 엔드포인트 |
| `ui` | UI 컴포넌트 |
| `ai` | AI/Gemini 관련 |
| `config` | 설정 파일 |

### 예시
```
feat(backend): add analyze-fridge API endpoint
fix(frontend): resolve image upload error handling
docs(readme): update installation instructions
refactor(ai): optimize vision prompt for accuracy
```

---

## 브랜치 전략

### 메인 브랜치
- `main`: 프로덕션 배포용
- `develop`: 개발 통합 브랜치 (선택적)

### 기능 브랜치
```
feature/<기능명>
fix/<버그명>
docs/<문서명>
```

### 예시
```
feature/recipe-generation
fix/image-upload-cors
docs/api-documentation
```

---

## .gitignore 권장 항목

```gitignore
# Python
__pycache__/
*.py[cod]
.venv/
.env

# Node
node_modules/
.next/
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

---

## 주요 Git 명령어

### 상태 확인
```bash
git status
git log --oneline -10
```

### 커밋
```bash
git add .
git commit -m "feat(backend): add new endpoint"
```

### 브랜치
```bash
git checkout -b feature/new-feature
git checkout main
git merge feature/new-feature
```

### 원격 저장소
```bash
git push origin main
git pull origin main
```

---

## 에이전트 사용 가이드

1. **커밋 시**: 위 컨벤션에 맞는 커밋 메시지 생성
2. **여러 파일 변경 시**: 관련 변경사항끼리 묶어서 커밋
3. **큰 기능 개발 시**: feature 브랜치 사용 권장
4. **커밋 전**: `git status`로 변경사항 확인
