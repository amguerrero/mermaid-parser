import { parse, Edge } from "../src";

test("Parses a complex flowchart correctly", async () => {
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

  const diag = await parse(flowchart);

  expect(diag.direction).toBe("LR");
  expect(Object.keys(diag.vertices).length).toBe(12);
  expect(diag.edges.length).toBe(10);
  diag.edges
    .filter((e) => e.end === "Test")
    .forEach((e) => {
      expect(e.stroke).toBe("dotted");
    });
  expect(diag.subGraphs.length).toBe(3);
});

test("Parses a simple graph correctly", async () => {
  const flowchart = `
graph LR
  A["The A"] --> B["The B"] --> C["The C"]
  E["The E"] --> C
  F["The F"] --> B
`;

  const diag = await parse(flowchart);

  expect(diag.direction).toBe("LR");
  expect(Object.keys(diag.vertices).length).toBe(5);
  expect(diag.vertices.A.text).toBe("The A");
  expect(diag.vertices.B.text).toBe("The B");
  expect(diag.vertices.C.text).toBe("The C");
  expect(diag.vertices.E.text).toBe("The E");
  expect(diag.vertices.F.text).toBe("The F");
  expect(diag.edges.length).toBe(4);

  console.log(diag.edges);
});
