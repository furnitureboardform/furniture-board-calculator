import type { ElementsData } from '../../lib/report';

interface ElementsTabProps {
  elementsData: ElementsData;
}

export function ElementsTab({ elementsData }: ElementsTabProps) {
  return (
    <div className="elements-grid">
      {elementsData.boxes.map((box) => (
        <div key={box.boxNumber} className="element-card">
          <div className="element-card__header">Box {box.boxNumber}</div>
          <div className="element-card__body">
            {box.door && (
              <div className="element-card__row">
                <span className="element-card__label">
                  Drzwi {box.door.doubleDoor ? 'podwójne' : 'pojedyncze'}
                  {box.door.doubleDoor && <span className="element-card__badge">×2</span>}
                </span>
                <span className="element-card__value">
                  {box.door.heightMm} × {box.door.widthMm} mm
                </span>
                <span className="element-card__meta">
                  Wszystkie obrzeża (4 strony) · zawiasy: {box.door.hinges} szt. · <span className="element-card__color element-card__color--kolor">kolor</span>
                </span>
              </div>
            )}
            {box.shelves && box.shelves.groups.map((g, gi) => (
              <div key={gi} className="element-card__row">
                <span className="element-card__label">Półki ({g.qty} szt.)</span>
                <span className="element-card__value">
                  {g.widthMm} × {box.shelves!.depthMm} mm
                </span>
                <span className="element-card__meta">
                  Obrzeże na szerokości {g.widthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                </span>
              </div>
            ))}
            {box.rods && box.rods > 0 && (
              <div className="element-card__row">
                <span className="element-card__label">Drążki ({box.rods} szt.)</span>
              </div>
            )}
            {box.partitions && box.partitions.length > 0 && (
              <>
                <div className="element-card__divider" />
                {box.partitions.map((s, si) => (
                  <div key={si} className="element-card__row">
                    <span className="element-card__label">Przegroda {si + 1} (1 szt.)</span>
                    <span className="element-card__value">{s.heightMm} × {s.depthMm} mm</span>
                    <span className="element-card__meta">
                      Obrzeże na wysokości {s.heightMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                    </span>
                  </div>
                ))}
              </>
            )}
            {box.hdf && box.hdf.map((hdfSection, hdfIndex) => (
              <div key={`${hdfSection.label}-${hdfIndex}`} className="element-card__row">
                <span className="element-card__label">Płyta HDF {hdfSection.label.toLowerCase()} (1 szt.)</span>
                <span className="element-card__value">
                  {hdfSection.widthMm} × {hdfSection.heightMm} mm
                </span>
                <span className="element-card__meta">
                  <span className="element-card__color element-card__color--szary">szary</span>
                </span>
              </div>
            ))}
            {box.panels && box.panels.length > 0 && (
              <>
                <div className="element-card__divider" />
                {box.panels.map((panel, panelIndex) => (
                  <div key={`${panel.label}-${panelIndex}`}>
                    <div className="element-card__row">
                      <span className="element-card__label">Płyta boczna {panel.label.toLowerCase()} (2 szt.)</span>
                      <span className="element-card__value">
                        {panel.sideHeightMm} × {panel.depthMm} mm
                      </span>
                      <span className="element-card__meta">
                        Obrzeże na wysokości {panel.sideHeightMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                      </span>
                    </div>
                    <div className="element-card__row">
                      <span className="element-card__label">Płyta górna {panel.label.toLowerCase()} (1 szt.)</span>
                      <span className="element-card__value">
                        {panel.topBottomWidthMm} × {panel.depthMm} mm
                      </span>
                      <span className="element-card__meta">
                        Obrzeże na szerokości {panel.topBottomWidthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                      </span>
                    </div>
                    <div className="element-card__row">
                      <span className="element-card__label">Płyta dolna {panel.label.toLowerCase()} (1 szt.)</span>
                      <span className="element-card__value">
                        {panel.topBottomWidthMm} × {panel.depthMm} mm
                      </span>
                      <span className="element-card__meta">
                        Obrzeże na szerokości {panel.topBottomWidthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
            {box.drawerBoards && (
              <>
                <div className="element-card__divider" />
                <div className="element-card__row">
                  <span className="element-card__label">
                    Szuflady ({box.drawerBoards.count} szt.{box.drawerBoards.sets > 1 ? (<> × {box.drawerBoards.sets} {box.drawerBoards.sets > 1 ? 'zestawy' : 'zestaw'}</>) : null})
                  </span>
                </div>
                <div className="element-card__row">
                  <span className="element-card__label">Bok szuflady ({box.drawerBoards.count * 2 * box.drawerBoards.sets} szt.)</span>
                  <span className="element-card__value">
                    {box.drawerBoards.sidePanel.heightMm} × {box.drawerBoards.sidePanel.depthMm} mm
                  </span>
                  <span className="element-card__meta">
                    Obrzeże na długości {box.drawerBoards.sidePanel.depthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                  </span>
                </div>
                <div className="element-card__row">
                  <span className="element-card__label">Front szuflady ({box.drawerBoards.count * box.drawerBoards.sets} szt.)</span>
                  <span className="element-card__value">
                    {box.drawerBoards.frontPanel.heightMm} × {box.drawerBoards.frontPanel.widthMm} mm
                  </span>
                  <span className="element-card__meta">
                    Wszystkie obrzeża (4 strony) · <span className="element-card__color element-card__color--szary">szary</span>
                  </span>
                </div>
                <div className="element-card__row">
                  <span className="element-card__label">Przód szuflady ({box.drawerBoards.count * box.drawerBoards.sets} szt.)</span>
                  <span className="element-card__value">
                    {box.drawerBoards.internalWall1.heightMm} × {box.drawerBoards.internalWall1.widthMm} mm
                  </span>
                  <span className="element-card__meta">
                    Obrzeże na długości {box.drawerBoards.internalWall1.widthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                  </span>
                </div>
                <div className="element-card__row">
                  <span className="element-card__label">Tył szuflady ({box.drawerBoards.count * box.drawerBoards.sets} szt.)</span>
                  <span className="element-card__value">
                    {box.drawerBoards.internalWall2.heightMm} × {box.drawerBoards.internalWall2.widthMm} mm
                  </span>
                  <span className="element-card__meta">
                    Obrzeże na długości {box.drawerBoards.internalWall2.widthMm} mm (1 bok) · <span className="element-card__color element-card__color--szary">szary</span>
                  </span>
                </div>
                <div className="element-card__row">
                  <span className="element-card__label">Dno szuflady HDF ({box.drawerBoards.count} szt.)</span>
                  <span className="element-card__value">
                    {box.drawerBoards.hdfBottom.depthMm} × {box.drawerBoards.hdfBottom.widthMm} mm
                  </span>
                  <span className="element-card__meta">
                    Bez obrzeży · <span className="element-card__color element-card__color--szary">szary</span>
                  </span>
                </div>
                <div className="element-card__row">
                  <span className="element-card__label">Płyta separatorów ({box.drawerBoards.separator.qty} szt.)</span>
                  <span className="element-card__value">
                    {box.drawerBoards.separator.heightMm} × {box.drawerBoards.separator.widthMm} mm
                  </span>
                  <span className="element-card__meta">
                    Bez obrzeży · <span className="element-card__color element-card__color--szary">szary</span>
                  </span>
                </div>
                <div className="element-card__row">
                  <span className="element-card__label">Płyta prowadnicy szuflady (2 szt.)</span>
                  <span className="element-card__value">
                    {box.drawerBoards.drawerRail.heightMm} × {box.drawerBoards.drawerRail.widthMm} mm
                  </span>
                  <span className="element-card__meta">
                    Jedno obrzeże na długości {box.drawerBoards.drawerRail.widthMm} mm · <span className="element-card__color element-card__color--szary">szary</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      <div className="element-card">
        <div className="element-card__header">Blendy / Wnęki</div>
        <div className="element-card__body">
          {[
            { label: 'Lewa', w: elementsData.niches.left.widthMm, h: elementsData.niches.left.heightMm },
            { label: 'Prawa', w: elementsData.niches.right.widthMm, h: elementsData.niches.right.heightMm },
            { label: 'Górna', w: elementsData.niches.top.widthMm, h: elementsData.niches.top.heightMm },
            { label: 'Dolna', w: elementsData.niches.bottom.widthMm, h: elementsData.niches.bottom.heightMm },
          ].map(({ label, w, h }) => (
            <div key={label} className="element-card__row">
              <span className="element-card__label">{label}</span>
              <span className="element-card__value">{w} × {h} mm</span>
              <span className="element-card__meta">Bez obrzeży · <span className="element-card__color element-card__color--kolor">kolor</span></span>
            </div>
          ))}
        </div>
      </div>

      {elementsData.maskings && (
        <div className="element-card">
          <div className="element-card__header">Maskownice</div>
          <div className="element-card__body">
            {elementsData.maskings.left && (
              <div className="element-card__row">
                <span className="element-card__label">Maskownica lewa</span>
                <span className="element-card__value">
                  {elementsData.maskings.left.heightMm} × {elementsData.maskings.left.widthMm} mm
                </span>
                <span className="element-card__meta">
                  Obrzeże na wysokości {elementsData.maskings.left.heightMm} mm (1 bok) · <span className="element-card__color element-card__color--kolor">kolor</span>
                </span>
              </div>
            )}
            {elementsData.maskings.right && (
              <div className="element-card__row">
                <span className="element-card__label">Maskownica prawa</span>
                <span className="element-card__value">
                  {elementsData.maskings.right.heightMm} × {elementsData.maskings.right.widthMm} mm
                </span>
                <span className="element-card__meta">
                  Obrzeże na wysokości {elementsData.maskings.right.heightMm} mm (1 bok) · <span className="element-card__color element-card__color--kolor">kolor</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
