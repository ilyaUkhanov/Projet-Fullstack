import {Point} from "@acrobatt";
import {Page} from "../type";

export interface IChallenge {
  name: string
  description: string
  shortDescription: string
  administratorsId: number[]
  scale: number
}

export class Challenge {
  public readonly attributes: IChallenge

  constructor(data: Partial<IChallenge>, public readonly id?: number) {
    this.attributes = {
      name: '',
      description: '',
      shortDescription: '',
      administratorsId: [],
      scale: 0,
      ...data
    }
  }
}