import { ContentType } from "../entities/lesson.entity";

export class CreateCourseDto {
  title: string;
  description?: string;
  price?: number;
}

export class UpdateCourseDto {
  title?: string;
  description?: string;
  price?: number;
}

export class CreateLessonDto {
  lessonName: string;
  contents: {
    serial: number;
    contentName?: string;
    type: ContentType;
    content: string;
  }[];
}

export class UpdateLessonDto {
  lessonName?: string;
}

export class CreateQuizDto {
  quizName: string;
  questions: {
    questionName: string;
    answers: {
      correct: boolean;
      content: string;
    }[];
  }[];
}

export class UpdateQuizDto {
  quizName?: string;
}

export class CreateLessonContentDto {
  serial: number;
  contentName?: string;
  type: ContentType;
  content: string;
}

export class CreateQuestionDto {
  questionName: string;
  answers: {
    correct: boolean;
    content: string;
  }[];
}