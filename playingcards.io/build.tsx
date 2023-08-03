#!/usr/bin/env -S deno run --no-prompt --allow-read --allow-write
import { BlobReader, TextReader, Uint8ArrayWriter, ZipWriter } from "https://deno.land/x/zipjs@v2.7.20/index.js";
import { range, zip } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
// @deno-types="npm:@types/react@18.2.15"
import React, { ReactNode } from "npm:react@18.2.0";
import ReactMarkdown from "npm:react-markdown@8.0.7";
import satori from "npm:satori@0.10.1";

function Rules({ page, numPages, content }: { page: number; numPages: number; content: string }) {
  const markdown = ReactMarkdown({ components: markdownComponents, children: content });
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
  FIRST = "Prosaic YOLO Shard",
  SECOND = "Pivotal Act",
  THIRD = "Agent Foundations",
  FOURTH = "Governance",
}
const strategies = [Strategy.FIRST, Strategy.SECOND, Strategy.THIRD, Strategy.FOURTH];

function bg(strategy: Strategy) {
  return strategy === Strategy.FIRST
    ? "bg-red-500"
    : strategy === Strategy.SECOND
    ? "bg-blue-500"
    : strategy === Strategy.THIRD
    ? "bg-green-500"
    : strategy === Strategy.FOURTH
    ? "bg-yellow-500"
    : "";
}

function InnovationCard({ risk, strategy }: { risk: number; strategy: Strategy }) {
  return (
    <div tw={`flex flex-col items-center w-full h-full font-sans text-base p-3 ${bg(strategy)}`}>
      <div tw="flex text-center text-3xl font-bold mb-3 mt-1">Innovation</div>
      <div tw="flex text-center text-2xl flex-grow">{strategy}</div>
      <div tw="flex text-center text-2xl font-bold mb-1 mt-3">Acceleration Risk: {risk}</div>
    </div>
  );
}

function ResearchCard({ strategy }: { strategy: Strategy }) {
  return (
    <div tw={`flex flex-col items-center w-full h-full font-sans text-base p-3 ${bg(strategy)}`}>
      <div tw="flex text-center text-3xl font-bold mb-3 mt-1">Research</div>
      <div tw="flex text-center text-2xl flex-grow">{strategy}</div>
    </div>
  );
}

function MadScienceCard() {
  return (
    <div tw={`flex flex-col items-center justify-center w-full h-full font-sans text-base p-1 bg-purple-500`}>
      <div tw="flex text-center text-3xl font-bold">MAD SCIENCE !</div>
    </div>
  );
}

function StrategyCard({ value, strategy }: { value: number; strategy: Strategy }) {
  return (
    <div tw={`flex flex-col items-center w-full h-full font-sans text-base p-3 ${bg(strategy)}`}>
      <div tw="flex text-center text-3xl font-bold mb-3 mt-1">Strategy</div>
      <div tw="flex text-center text-2xl mb-1">{strategy}</div>
      <div tw="flex text-center text-9xl font-bold">{value}</div>
    </div>
  );
}

const pages = (await Deno.readTextFile("rules.md")).split("---");
for (const [page, pageNum] of enumerate(pages)) {
  render(`images/rules_${pageNum + 1}.svg`, <Rules page={pageNum + 1} numPages={pages.length} content={page} />);
}

for (const [strategy, strategyNum] of enumerate(strategies)) {
  for (const risk of range(6)) {
    render(`images/innovation_${strategyNum + 1}_${risk}.svg`, <InnovationCard risk={risk} strategy={strategy} />);
  }
}

for (const [strategy, strategyNum] of enumerate(strategies)) {
  render(`images/research_${strategyNum + 1}.svg`, <ResearchCard strategy={strategy} />);
}

render(`images/mad_science.svg`, <MadScienceCard />);

for (const [strategy, strategyNum] of enumerate(strategies)) {
  for (const value of range(13)) {
    render(`images/strategy_${strategyNum + 1}_${value + 1}.svg`, <StrategyCard value={value + 1} strategy={strategy} />);
  }
}

const markdownComponents = {
  h1: ({ node, ...props }: Record<string, unknown>) => <div tw="flex text-xl font-bold mb-0.5" {...props} />,
  h3: ({ node, ...props }: Record<string, unknown>) => <div tw="flex text-lg font-bold mb-0.5" {...props} />,
  h4: ({ node, ...props }: Record<string, unknown>) => <div tw="flex font-bold" {...props} />,
  p: ({ node, ...props }: Record<string, unknown>) => <div tw="flex mb-0.5" {...props} />,
  ol: ({ node, ...props }: Record<string, unknown>) => <div tw="flex flex-col" {...props} />,
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
              "9xl": "70px",
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
  await zipWriter.add(`userassets/${file.name}`, new BlobReader(new Blob([await Deno.readFile(`images/${file.name}`)])));
}
await zipWriter.close();
await Deno.writeFile("output.pcio", await zipFileWriter.getData());
