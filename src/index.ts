import puppeteer, { Page } from "puppeteer";
import path from "path";
import url from "url";
import fs from "fs";
import { Mermaid } from "mermaid";

async function preparePage() {
  const mermaidIIFEPath = path.resolve(
    path.dirname(require.resolve("mermaid")),
    "mermaid.js"
  );

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on("console", (msg) => {
    console.log(msg.text());
  });

  page.on("error", (err) => {
    console.error(err.message);
  });

  await page.goto(
    url.pathToFileURL(path.join(__dirname, "..", "page", "index.html")).href
  );

  await page.addScriptTag({ path: mermaidIIFEPath });

  return {
    page,
    cleanup: async () => {
      await browser.close();
    },
  };
}

const getDiagram = async (page: Page, fc: string) => {
  return await page.$eval(
    "#diagram",
    async (_, flowchart) => {
      const { mermaid } = globalThis as unknown as { mermaid: Mermaid };

      mermaid.initialize({
        startOnLoad: false,
      });

      const diagram = await mermaid.mermaidAPI.getDiagramFromText(flowchart);
      const parser = (diagram.getParser() as any).yy;
      return {
        title: parser.getDiagramTitle(),
        accTitle: parser.getAccTitle(),
        edges: parser.getEdges(),
        vertices: parser.getVertices(),
        tooltip: parser.getTooltip(),
        direction: parser.getDirection(),
        classes: parser.getClasses(),
        subGraphs: parser.getSubGraphs(),
      };
    },
    fc
  );
};

const getSvg = async (page: Page, fc: string) => {
  return await page.$eval(
    "#diagram",
    async (_, flowchart) => {
      const { mermaid } = globalThis as unknown as { mermaid: Mermaid };

      mermaid.initialize({
        startOnLoad: false,
      });

      return (await mermaid.mermaidAPI.render("diagram", flowchart))?.svg;
    },
    fc
  );
};

const getPng = async (page: Page, fc: string) => {
  await page.$eval(
    "#diagram",
    async (diagContainer, flowchart) => {
      const { mermaid } = globalThis as unknown as { mermaid: Mermaid };

      mermaid.initialize({
        startOnLoad: false,
      });

      const { svg: svgText } = await mermaid.render(
        "fc-svg",
        flowchart,
        diagContainer
      );
      diagContainer.innerHTML = svgText;
    },
    fc
  );

  const clip = await page.$eval("svg", (svg) => {
    const react = svg.getBoundingClientRect();
    return {
      x: Math.floor(react.left),
      y: Math.floor(react.top),
      width: Math.ceil(react.width),
      height: Math.ceil(react.height),
    };
  });
  await page.setViewport({
    ...page.viewport(),
    width: clip.x + clip.width,
    height: clip.y + clip.height,
  });
  return await page.screenshot({ clip });
};

export type Edge = {
  start: string;
  end: string;
  type: string;
  text: string;
  labelType: string;
  stroke: string;
  length: number;
};

export type Vertix = {
  id: string;
  labelType: string;
  domId: string;
  styles: any[];
  classes: any[];
  text: string;
  type: string;
  props: any;
};

export type SubGraph = {
  id: string;
  nodes: string[];
  title: string;
  classes: any[];
  labelType: string;
};

export type ParsedDiagram = {
  title: string;
  accTitle: string;
  edges: Edge[];
  vertices: { [key: string]: Vertix };
  tooltip: string;
  direction: string;
  classes: string[];
  subGraphs: SubGraph[];
};

export async function parse(diagramString: string): Promise<ParsedDiagram> {
  const { page, cleanup } = await preparePage();
  try {
    const diagram = await getDiagram(page, diagramString);

    return diagram;
  } finally {
    await cleanup();
  }
}

export async function toSvg(
  diagramString: string,
  filePath?: string
): Promise<string> {
  const { page, cleanup } = await preparePage();
  try {
    const svg = await getSvg(page, diagramString);

    if (filePath) {
      fs.writeFileSync(filePath, svg);
    }
    return svg;
  } finally {
    await cleanup();
  }
}

export async function toPng(
  diagramString: string,
  filePath?: string
): Promise<Buffer> {
  const { page, cleanup } = await preparePage();
  try {
    const pngData = await getPng(page, diagramString);

    if (filePath) {
      fs.writeFileSync(filePath, pngData);
    }

    return pngData;
  } finally {
    await cleanup();
  }
}
