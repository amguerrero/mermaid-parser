# Mermaid Parser

Mermaid Parser is a parser for mermaid diagrams to help us retrieve information about mermaid diagrams we can then use in our projects.

Parsing a mermaid diagram returns the following information:

```typescript
ParsedDiagram = {
  title: string;          // Title
  accTitle: string;
  edges: Edge[];          // The connections between nodes
  vertices: {             // Map of Nodes with the Node Id as key
    [key: string]: Vertix
  };
  tooltip: string;
  direction: string;      // Direction of the diagram
  classes: string[];
  subGraphs: SubGraph[];  // Information about the subgraphs, like what nodes are in side each one.
};
```

## How to use it

First add `simple-mermaid-parser` to the project.

```bash
npm i simple-mermaid-parser
```

Then import it where you need:

```typescript
import { parse } from "simple-mermaid-parser";
```

So you can use it to parse mermaid diagrams:

```typescript
const diagram = `
graph LR
  A["The A"] --> B["The B"] --> C["The C"]
  E["The E"] --> C
  F["The F"] --> B
`;
const diagramInfo = await parse(diagram);

console.log(diagramInfo.edges);
/*
Output:
[
  {
    start: 'A',
    end: 'B',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'B',
    end: 'C',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'E',
    end: 'C',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'F',
    end: 'B',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  }
]
*/
```
