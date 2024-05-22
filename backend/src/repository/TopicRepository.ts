import { Repository } from "typeorm";
import { Topic } from "../model/Topic.js";
import dataSource from "../dataSource.js";

export interface TopicRepository extends Repository<Topic> {

}

export const topicRepository: TopicRepository = dataSource.getRepository(Topic).extend({

} as TopicRepository);