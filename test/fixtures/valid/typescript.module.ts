// Parts copied from:
// https://github.com/rstacruz/cheatsheets/blob/cb4e03077f3753d5c23b6b2ac142dcf68ff20f9c/typescript.md
// License: MIT.
//
// Parts copied from:
// https://github.com/rmolinamir/typescript-cheatsheet/blob/865f16a68402b8473bb50e3b6587e17eb2a59e92/README.md
// License: ISC.

let isDone1: boolean
let isDone2: boolean = false

function add (a: number, b: number): number {
  return a + b
}

function identity <T> (x: T): T {
  return x
}

const g = 9.82
const div = <T extends number>(x: T): number => x/2/g;

let input
let len1: number = (input as string).length
let len2: number = (<string> input).length  /* not allowed in JSX */

export interface User extends Object {
  name: string,
  readonly age?: number
  [key: number]: Object[]
}

type Name = string | string[] & { smoosh: () => Array<any> }

function getUser(callback: (user?: User) => any) { callback() }

abstract class Greeter<T> implements User {
  public name: string
  [key: number]: Object[]
  static instances = 0
  protected greeting: T
  constructor(
    public x: number,
    public y: number, message: T
  ) {
    this.greeting = message
  }
  private someUselessValue!: number;
  public printName = () => {
    console.log(this.name);
  }
}

const address: [string, number] = ["Street", 99];

enum Color {
  Gray, // 0
  Red, // 1
  Green = 100, // 100
  Blue, // 101
  Yellow = 2 // 2
}

enum Options {
  FIRST,
  EXPLICIT = 1,
  BOOLEAN = Options.FIRST | Options.EXPLICIT
}

// @ts-ignore
declare module "path" {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export var sep: string;
}

// Added a space in `K>>` as a workaround to this edge case:
// js-tokens: `K`, `>>`
// should be: `K`, `>`, `>`
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K> >

type Fish = {swim: Function}
type Bird = Object

function isFish(pet: Fish | Bird): pet is Fish {
  return (<Fish>pet).swim !== undefined;
}
