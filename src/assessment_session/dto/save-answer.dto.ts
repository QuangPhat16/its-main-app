import { IsUUID } from 'class-validator';

export class SaveAnswerDto {
  @IsUUID()
  questionId: string;

  @IsUUID()
  selectedAnswerId: string;
}
