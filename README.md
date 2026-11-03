# Terminus Maximus maintenance

Hero Guides score updates start with [HeroDatabase current context](../HeroDatabase/CURRENT_CONTEXT.md) and the [local score-update workflow](docs/hero-score-update-workflow.md). The [maintenance overview](docs/hero-guides.md) documents page sources and checks. Use [Hero Score Refresh](/Users/danfoster01/.codex/skills/hero-score-refresh/SKILL.md) for approved score/copy application and local Top 10 refreshes.

Current Overall policy: four equal scores (Raid, War, Horde, Popularity), plus a non-stacking **+0.25** for required Campaign/Event Campaign heroes, capped at 10. Require all four; rank unrounded values. Site order: **Overall, Raid, War, Horde, Popularity, Bonus**. Popularity uses the existing Energy/stamina blue beaker. Current research and frozen monthly Top 10 snapshots require separate refresh steps; local snapshot creation does not deploy online.

The original Astro setup notes follow.

# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
