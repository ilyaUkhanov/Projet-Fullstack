import {useQuery} from "react-query";
import axios, {AxiosError} from "axios";
import {Point} from "@acrobatt";
import {Obstacle} from "./entities/Obstacle";

export type ObstacleApi = {
  id: number,
  position: number
  riddle: string
  segmentId: number
}

const getObstacles = async (segmentId: number): Promise<Obstacle[]> => {
  return await axios.get<ObstacleApi[]>(`/obstacles?segmentId=${segmentId}`,)
    .then(response => {
      let obstacles: Obstacle[] = response.data.map(obstacleApi => {
        return new Obstacle({
          position: obstacleApi.position,
          segmentId: obstacleApi.segmentId,
          riddle: obstacleApi.riddle
        }, obstacleApi.id)
      })
      return obstacles
    })
}

export default function useObstacles(segmentId: number) {
  return useQuery<Obstacle[], AxiosError>(
    ['obstacles', segmentId],
    () => getObstacles(segmentId)
  )
}