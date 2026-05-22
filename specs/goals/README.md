# MetaScope — Goals Index

Tài liệu mục tiêu triển khai chia theo từng package trong monorepo.

| File                                     | Scope                | Packages                         |
| ---------------------------------------- | -------------------- | -------------------------------- |
| [GOAL_BE.md](./GOAL_BE.md)               | Backend API + Worker | `apps/api`, `apps/worker`        |
| [GOAL_FE.md](./GOAL_FE.md)               | Frontend Web App     | `apps/web`                       |
| [GOAL_CMS_ADMIN.md](./GOAL_CMS_ADMIN.md) | CMS & Admin Panel    | `apps/cms`, `apps/admin`         |
| [GOAL_INFRA.md](./GOAL_INFRA.md)         | Infrastructure & Ops | Docker, CI/CD, Nginx, Monitoring |

---

## Thứ tự ưu tiên triển khai

```
1. INFRA (local docker) → môi trường dev sẵn sàng
2. BE Auth + DB schema  → identity và data layer
3. BE Meta + Worker     → data pipeline cho tier list
4. CMS + Admin          → approve data trước khi FE dùng
5. FE Meta Library      → guest-accessible features
6. BE + FE AI Tools     → quota, guards, AI integration
7. BE + FE Payment      → PayOS webhook, subscription flow
```

---

## Dependency quan trọng

- FE không thể wire API thật cho đến khi BE module tương ứng done.
- CMS/Admin cần Firebase Auth setup xong từ BE.
- AI Tools cần Quota system done trước.
- Payment flow cần DB schema (`payment_transactions`, `entitlement_ledger`) done trước.
- Web FE chỉ thấy comp data khi Analyst đã approve trong Admin Panel.
