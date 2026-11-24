import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import {
  Button,
  DecisionActions,
  Icon,
  Link,
  NetworkRow,
  Row,
  Stack,
  StatusIndicator,
  Text,
  VolumeControl,
} from '@nearic/ui';
import './pulse-box.css';

const outcomes = {
  asking: {
    title: 'Запустить тесты?',
    detail: 'Проверить сборку прошивки.',
    notice: 'Есть вопрос',
    pose: 'ждёт ответа',
  },
  primary: {
    title: 'Тесты запущены',
    detail: 'Ответ отмечен в примере.',
    notice: 'Тесты запущены',
    pose: 'откликается',
  },
  secondary: {
    title: 'Отложено',
    detail: 'Можно вернуться к вопросу.',
    notice: 'Отложено',
    pose: 'отдыхает',
  },
};
type Answer = keyof typeof outcomes;

function Lcd({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const update = () => setScale(element.clientWidth / 320);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lcd-frame" ref={frame}>
      <div className="lcd" style={{ transform: 'scale(' + scale + ')' }}>
        {children}
      </div>
    </div>
  );
}

export function PulseBox() {
  const [answer, setAnswer] = useState<Answer>('asking');
  const [volume, setVolume] = useState(60);
  const question = useRef<HTMLHeadingElement>(null);
  const current = outcomes[answer];
  function openQuestion() {
    question.current?.focus({ preventScroll: true });
    question.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  return (
    <section
      className="box-stage"
      data-family="box"
      data-platform="box"
      aria-label="Экраны BOX, 320 на 240"
    >
      <figure>
        <figcaption>Главный экран</figcaption>
        <Lcd>
          <Row className="lcd-header home-header">
            <Text variant="heading">Codex · Прошивка</Text>
            <StatusIndicator>В сети</StatusIndicator>
          </Row>
          <div
            className="lcd-character"
            style={{ backgroundImage: 'url(./assets/box/explorer.webp)' }}
            aria-label={'Полярник — ' + current.pose}
            role="img"
            data-pose={answer}
          />
          <Button className="lcd-notice" variant="secondary" onClick={openQuestion}>
            {current.notice}
            <Icon name="next" size="small" />
          </Button>
        </Lcd>
        <Link href="../#box/atoms/status-indicator">Индикатор связи</Link>
      </figure>
      <figure>
        <figcaption>Запрос агента</figcaption>
        <Lcd>
          <Row className="lcd-header">
            <Row className="sender">
              <span className="sender-sign">
                <Icon name="message" size="small" />
              </span>
              <Text variant="heading">Codex</Text>
            </Row>
            <Text variant="label" muted>
              Прошивка
            </Text>
          </Row>
          <Stack className="lcd-question" aria-live="polite">
            <h2 ref={question} tabIndex={-1}>
              <Text variant="title">{current.title}</Text>
            </h2>
            <Text muted>{current.detail}</Text>
          </Stack>
          {answer === 'asking' ? (
            <DecisionActions className="lcd-actions" onDecision={setAnswer} />
          ) : (
            <Button className="lcd-actions" variant="secondary" onClick={() => setAnswer('asking')}>
              Ещё раз
            </Button>
          )}
        </Lcd>
        <Link href="../#box/components/box-actions">Кнопки ответа</Link>
      </figure>
      <figure>
        <figcaption>Настройки</figcaption>
        <Lcd>
          <Row className="lcd-header">
            <Text variant="heading">Настройки</Text>
            <Text variant="label" muted>
              BOX
            </Text>
          </Row>
          <NetworkRow className="lcd-network" online value="Домашняя" />
          <VolumeControl className="lcd-volume" value={volume} onChange={setVolume} />
        </Lcd>
        <Link href="../#box/components/box-volume">Регулятор громкости</Link>
      </figure>
    </section>
  );
}
