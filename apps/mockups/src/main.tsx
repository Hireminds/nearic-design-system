import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Icon, Link, Row, Stack, Text } from '@nearic/ui';
import '@nearic/ui/styles.css';
import './shell.css';
import { PulseBox } from './box/PulseBox';
import { PulseWeb } from './web/PulseWeb';

const profiles = [
  { key: 'desktop', name: 'Личный кабинет', context: 'Компьютер' },
  { key: 'mobile', name: 'Мобильный кабинет', context: 'Телефон' },
  { key: 'box', name: 'Экран BOX', context: '320 × 240' },
];
function route() {
  return window.location.hash.slice(1);
}
function App() {
  const [selected, setSelected] = useState(route);
  useEffect(() => {
    const changed = () => {
      setSelected(route());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  const profile = profiles.find((item) => item.key === selected);
  return (
    <div
      className="mockup-app"
      data-family="web"
      data-platform={selected === 'mobile' ? 'mobile' : 'desktop'}
    >
      <header className="mockup-header">
        <Row>
          <Icon name="wave" />
          <Link href="#">nearic</Link>
          {profile && <Link href="#">Все макеты</Link>}
        </Row>
        <Link href="../">Дизайн-система</Link>
      </header>
      {profile ? (
        <main className={'mockup-view view-' + selected}>
          <div className="mockup-title">
            <h1>{profile.name}</h1>
            <Text muted>Пульс · {profile.context}</Text>
          </div>
          {selected === 'box' ? (
            <PulseBox />
          ) : (
            <PulseWeb platform={selected === 'mobile' ? 'mobile' : 'desktop'} />
          )}
          {selected !== 'box' && (
            <Link className="mockup-reference" href={'../#' + selected + '/components/device-card'}>
              Карточка BOX в каталоге
            </Link>
          )}
        </main>
      ) : (
        <main className="mockup-home">
          <h1>Макеты «Пульса»</h1>
          <div className="mockup-grid">
            {profiles.map((item) => (
              <Link key={item.key} className="mockup-tile" href={'#' + item.key}>
                <img src={'./assets/gallery/' + item.key + '.webp'} alt="" />
                <Stack>
                  <Text variant="label" muted>
                    {item.context}
                  </Text>
                  <Text variant="heading">{item.name}</Text>
                </Stack>
              </Link>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
