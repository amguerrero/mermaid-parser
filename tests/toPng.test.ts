import fs from "fs";
import { toPng } from "../src";

beforeEach(() => {
  jest.setTimeout(30000);
});

afterEach(() => {
  if (fs.existsSync("test.png")) {
    fs.unlinkSync("test.png");
  }
});

test("Convert a complex flowchart to Png (in test.png) correctly", async () => {
  const flowchart = `
  flowchart LR
    subgraph Proj1["Project 1"]
      DevA1["Dev A Project 1"] --> Merge1["Merge Project 1"]
      DevB1["Dev B Project 1"] --> Merge1
      DevC1["Dev C Project 1"] --> Merge1
    end
  
    subgraph Proj2["Project 2"]
      DevA2["Dev A Project 2"] --> Merge2["Merge Project 2"]
      DevB2["Dev B Project 2"] --> Merge2
    end
  
    subgraph Bundle["Main"]
      Merge --> Prod["Production"]
    end
  
    Proj1 -.->|test-environment| Test
    Proj2 -.->|test-environment| Test
  
    Merge1 --> Merge
    Merge2 --> Merge
`;

  const png = await toPng(flowchart, "test.png");

  expect(png).toBeDefined();
  expect(fs.existsSync("test.png")).toBe(true);
});

test("Parses a simple graph correctly", async () => {
  const flowchart = `
graph LR
  classDef added fill:#bfb,stroke:#5f5,stroke-width:4px,color:#090
  A["The A"]:::added --> B["The B"] --> C["The C"]
  E["The E"] --> C
  F["The F"] --> B
`;

  const png = await toPng(flowchart);
  expect(png).toBeDefined();
});
