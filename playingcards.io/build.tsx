#!/usr/bin/env -S deno run --no-prompt --allow-read --allow-write
import { BlobReader, TextReader, Uint8ArrayWriter, ZipWriter } from "https://deno.land/x/zipjs@v2.7.20/index.js";
import { range, zip } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
// @deno-types="npm:@types/react@18.2.15"
import React, { ReactNode } from "npm:react@18.2.0";
import ReactMarkdown from "npm:react-markdown@8.0.7";
import satori from "npm:satori@0.10.1";
import { encode } from "https://deno.land/std@0.202.0/encoding/base64.ts";

function encodeImage(image: string) {
  return `data:image/png;base64,${encode(Deno.readFileSync(image))}`;
}

function Rules({
  page,
  numPages,
  content,
}: {
  page: number;
  numPages: number;
  content: string;
}) {
  const markdown = ReactMarkdown({
    components: markdownComponents,
    children: content,
  });
  return (
    <div tw="flex flex-col items-center w-full h-full bg-white font-sans text-base p-1">
      <div tw="flex flex-col flex-grow w-full">
        <div tw="flex flex-col" {...markdown.props} />
      </div>
      <div tw="flex text-center pt-0.5">
        Page {page} of {numPages}
      </div>
    </div>
  );
}

enum Strategy {
  FIRST = "Prosaic Alignment",
  SECOND = "Pivotal Act",
  THIRD = "Agent Foundations",
  FOURTH = "Governance",
}

const strategies = [
  Strategy.FIRST,
  Strategy.SECOND,
  Strategy.THIRD,
  Strategy.FOURTH,
];

function bg(strategy: Strategy) {
  return strategy === Strategy.FIRST
    ? "bg-prosaic_alignment"
    : strategy === Strategy.SECOND
    ? "bg-pivotal_act"
    : strategy === Strategy.THIRD
    ? "bg-agent_foundations"
    : strategy === Strategy.FOURTH
    ? "bg-governance"
    : "";
}

function image(strategy: Strategy) {
  return strategy === Strategy.FIRST
    ? encodeImage("images/prosaic_alignment.png")
    : strategy === Strategy.SECOND
    ? encodeImage("images/pivotal_act.png")
    : strategy === Strategy.THIRD
    ? encodeImage("images/agent_foundations.png")
    : strategy === Strategy.FOURTH
    ? encodeImage("images/governance.png")
    : "";
}

function flavor_text(strategy: Strategy) {
  return strategy === Strategy.FIRST
    ? "Improve and scale up current known techniques."
    : strategy === Strategy.SECOND
    ? "Create aligned AI capable enough to prevent takeover."
    : strategy === Strategy.THIRD
    ? "Understand the fundamental nature of neural networks."
    : strategy === Strategy.FOURTH
    ? "Regulate compute and data needed for AGI."
    : "";
}

function InnovationCard({
  risk,
  strategy,
}: {
  risk: number;
  strategy: Strategy;
}) {
  return (
    <div
      tw={`flex flex-col items-center w-full h-full font-sans text-base
      ${bg(strategy)}`}
    >
      <div tw="flex text-center text-3xl font-bold mb-0.5 mt-1">Innovation</div>
      <div tw="flex text-center text-2xl mb-1">{strategy}</div>
      <img src={image(strategy)} tw="w-full mx-auto" />
      <div tw="flex text-center text-2xl font-bold mb-1">
        Accel. Risk: {risk}
      </div>
    </div>
  );
}

function ResearchCard({ strategy }: { strategy: Strategy }) {
  return (
    <div
      tw={`flex flex-col items-center w-full h-full font-sans text-base
      ${bg(strategy)}`}
    >
      <div tw="flex text-center text-3xl font-bold mb-0.5 mt-1">Research</div>
      <div tw="flex text-center text-2xl mb-1">{strategy}</div>
      <img src={image(strategy)} tw="w-full mx-auto" />
    </div>
  );
}

function MadScienceCard() {
  return (
    <div
      tw={`flex flex-col items-center justify-center w-full h-full font-sans text-base bg-mad_science`}
    >
      <div tw="flex text-center text-5xl text-white font-bold">
        MAD SCIENCE!
      </div>
      <img src={encodeImage("images/mad_science.png")} tw="w-full mx-auto" />
    </div>
  );
}

function StrategyCard({
  value,
  strategy,
}: {
  value: number;
  strategy: Strategy;
}) {
  return (
    <div
      tw={`flex flex-col items-center w-full h-full font-sans text-base p-3 ${
        bg(
          strategy,
        )
      }`}
    >
      <div tw="flex w-full items-center h-[20px] justify-between">
        <div tw={`flex text-${value < 10 ? "4xl" : "3xl"} font-bold`}>
          {value}
        </div>
        <div tw="flex text-3xl font-bold">Strategy</div>
      </div>
      <div tw={`flex text-center text-3xl mt-2 mb-1 font-bold`}>{strategy}</div>
      <div tw="flex grow"></div>
      <div tw="flex text-center text-2xl mb-1">{flavor_text(strategy)}</div>
    </div>
  );
}

const pages = (await Deno.readTextFile("rules.md")).split("---");
for (const [page, pageNum] of enumerate(pages)) {
  render(
    `images/rules_${pageNum + 1}.svg`,
    <Rules page={pageNum + 1} numPages={pages.length} content={page} />,
  );
}

for (const [strategy, strategyNum] of enumerate(strategies)) {
  for (const risk of range(6)) {
    render(
      `images/innovation_${strategyNum + 1}_${risk}.svg`,
      <InnovationCard risk={risk} strategy={strategy} />,
    );
  }
}

for (const [strategy, strategyNum] of enumerate(strategies)) {
  render(
    `images/research_${strategyNum + 1}.svg`,
    <ResearchCard strategy={strategy} />,
  );
}

render(`images/mad_science.svg`, <MadScienceCard />);

for (const [strategy, strategyNum] of enumerate(strategies)) {
  for (const value of range(13)) {
    render(
      `images/strategy_${strategyNum + 1}_${value + 1}.svg`,
      <StrategyCard value={value + 1} strategy={strategy} />,
    );
  }
}

const markdownComponents = {
  h1: ({ node, ...props }: Record<string, unknown>) => <div tw="flex text-xl font-bold mb-0.5" {...props} />,
  h3: ({ node, ...props }: Record<string, unknown>) => <div tw="flex text-lg font-bold mb-0.5" {...props} />,
  h4: ({ node, ...props }: Record<string, unknown>) => <div tw="flex font-bold" {...props} />,
  p: ({ node, ...props }: Record<string, unknown>) => <div tw="flex mb-0.5" {...props} />,
  ol: ({ node, ...props }: Record<string, unknown>) => <div tw="flex flex-col" {...props} />,
  ul: ({ node, ...props }: Record<string, unknown>) => <div tw="flex flex-col" {...props} />,
  li: ({ node, ...props }: Record<string, unknown>) => <div tw="flex mb-0.5">• {props.children as ReactNode}</div>,
};

function enumerate<T>(input: Array<T>): Array<[T, number]> {
  return zip(input, range(input.length));
}

async function render(path: string, node: ReactNode) {
  await Deno.writeTextFile(
    path,
    await satori(node, {
      width: 103,
      height: 160,
      embedFont: false,
      fonts: [
        {
          name: "Verdana",
          data: await Deno.readFile("fonts/verdana.woff"),
          weight: 400,
          style: "normal",
        },
        {
          name: "Verdana",
          data: await Deno.readFile("fonts/verdana-bold.woff"),
          weight: 800,
          style: "normal",
        },
      ],
      tailwindConfig: {
        theme: {
          extend: {
            fontFamily: {
              sans: "Verdana",
            },
            fontSize: {
              base: "4.5px",
              lg: "5.5px",
              xl: "6px",
              "2xl": "10px",
              "3xl": "12px",
              "4xl": "16px",
              "5xl": "18px",
              "7xl": "22px",
              "9xl": "70px",
            },
            width: {
              research: "77px",
              innovation: "67px",
            },
            height: {
              research: "77px",
              innovation: "67px",
            },
            colors: {
              prosaic_alignment: "#5ac2d2",
              governance: "#63c9c8",
              agent_foundations: "#e39b9d",
              pivotal_act: "#d5dab8",
              mad_science: "#d66546",
            },
          },
        },
      },
    }),
  );
}

const output = JSON.parse(await Deno.readTextFile("template.json"));
const zipFileWriter = new Uint8ArrayWriter();
const zipWriter = new ZipWriter(zipFileWriter);
await zipWriter.add("widgets.json", new TextReader(JSON.stringify(output)));
for await (const file of Deno.readDir("images")) {
  if (!file.isFile) continue;
  await zipWriter.add(
    `userassets/${file.name}`,
    new BlobReader(new Blob([await Deno.readFile(`images/${file.name}`)])),
  );
}
await zipWriter.close();
await Deno.writeFile("output.pcio", await zipFileWriter.getData());
