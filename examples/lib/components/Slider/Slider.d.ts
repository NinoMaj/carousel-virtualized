import * as React from 'react';
import { FixedSizeList } from 'react-window';
interface IRenderComponentProps<T> {
    data: T;
    index: number;
    isScrolling?: boolean;
    style: object;
}
declare type RenderComponent<T> = (props: IRenderComponentProps<T>) => React.ReactElement<any> | null;
interface ISliderProps {
    autofocus?: boolean;
    carouselName?: string;
    carouselRef: React.RefObject<FixedSizeList>;
    children: RenderComponent<unknown>;
    currentIndex: number;
    height: string | number;
    initialScrollOffset?: number;
    innerClassName?: string;
    isMounted: boolean;
    itemCount: number;
    itemData?: any;
    itemSize: number;
    outerClassName?: string;
    outerStyle?: object;
    overscanCount?: number;
    slideCount?: number;
    style?: object;
    width: number;
    onMouseClick?(): any;
    onKeyDown?(): any;
    onMouseDown?(): any;
    onMouseMove?(): any;
    onTouchCancel?(): any;
    onTouchEnd?(): any;
    onTouchMove?(): any;
    onTouchStart?(): any;
    onItemsRendered?(items: any): any;
    setContainerRef?(): void;
}
export declare class Slider extends React.Component<ISliderProps> {
    constructor(props: any);
    componentDidUpdate(prevProps: ISliderProps): void;
    render(): JSX.Element;
    private scrollToItem;
}
export {};
