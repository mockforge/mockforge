# mockforge

## Installation

```bash
npm install mockforge
```

## Usage

### Configuration

First, you should install the plugin for your bundler.

In vite, you can use the vite plugin.

```javascript
import { mockForge } from 'mockforge/vite-plugin';

const plugins = [mockForge({})];
```

In webpack, you can use the webpack plugin.

```javascript
import { MockForgeWebpackPlugin } from 'mockforge/webpack5-plugin';
const plugins = [new MockForgeWebpackPlugin()];
```

Then you can start the server with the environment variable `MOCK_FORGE` set to `true`.

Such as in vite:

```bash
MOCK_FORGE=true vite
```

### Manual Mocking

When you open the project, you will see the log of the server.

`MockForge initialized, Access http://localhost:50930 to manage mock data`

You can access the address to manage the mock data.
